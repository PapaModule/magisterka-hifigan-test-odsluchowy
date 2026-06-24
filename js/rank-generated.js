// js/rank-generated.js
export function computeMetrics(audioData, sampleRate = 44100) {
  // SNR: signal RMS / noise floor RMS
  const frameLen = Math.floor(sampleRate / 10); // 100ms frames
  const frames = [];
  for (let i = 0; i < audioData.length; i += frameLen) {
    const frame = audioData.slice(i, Math.min(i + frameLen, audioData.length));
    const rms = Math.sqrt(frame.reduce((sum, x) => sum + x * x, 0) / frame.length);
    frames.push(rms);
  }

  const signalRms = Math.sqrt(audioData.reduce((sum, x) => sum + x * x, 0) / audioData.length);
  const sorted = [...frames].sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(sorted.length * 0.1)]; // 10th percentile
  const snr = 20 * Math.log10((signalRms + 1e-9) / (noiseFloor + 1e-9));

  // Spectral flatness (Wiener entropy) — simplified
  const fft = computeFFT(audioData);
  const magnitude = fft.map(x => Math.abs(x));
  const magMean = magnitude.reduce((a, b) => a + b, 0) / magnitude.length;
  const geoMean = Math.exp(magnitude.reduce((sum, x) => sum + Math.log(x + 1e-9), 0) / magnitude.length);
  const flatness = geoMean / (magMean + 1e-9);

  // Zero crossing rate
  let crossings = 0;
  for (let i = 1; i < audioData.length; i++) {
    if ((audioData[i - 1] < 0 && audioData[i] >= 0) || (audioData[i - 1] >= 0 && audioData[i] < 0)) {
      crossings++;
    }
  }
  const zcr = crossings / audioData.length;

  return { snr, flatness: Math.min(flatness, 1.0), zcr };
}

function computeFFT(data) {
  const N = Math.min(data.length, 1024);
  return data.slice(0, N);
}

export async function rankSamples(filePaths, metric = 'snr') {
  const metricsData = [];
  for (const path of filePaths) {
    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const data = audioBuffer.getChannelData(0);
      const metrics = computeMetrics(data, audioBuffer.sampleRate);
      metricsData.push({ path, ...metrics });
    } catch (error) {
      console.warn(`Failed to load ${path}:`, error);
    }
  }

  const sorted = [...metricsData].sort((a, b) => {
    if (metric === 'snr') return b.snr - a.snr; // Higher SNR is better
    if (metric === 'flatness') return a.flatness - b.flatness; // Lower flatness is better
    return 0;
  });

  return sorted.map((item, rank) => ({ ...item, rank: rank + 1 }));
}
