// js/rank-generated.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeMetrics, rankSamples } from './rank-generated.js';

function createMockAudioData(sampleRate = 44100, durationSec = 1, frequency = 1000) {
  const buffer = new Float32Array(sampleRate * durationSec);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = 0.5 * Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }
  return buffer;
}

test('SNR computation returns valid metrics', () => {
  const audioData = createMockAudioData();
  const metrics = computeMetrics(audioData, 44100);

  // For a clean sine wave, SNR should be reasonable (can be very high or very low depending on noise floor)
  assert.equal(typeof metrics.snr, 'number', 'snr is not a number');
  assert.ok(!isNaN(metrics.snr), 'snr is NaN');
  assert.ok(isFinite(metrics.snr), 'snr is not finite');
  assert.equal(typeof metrics.flatness, 'number', 'flatness is not a number');
  assert.ok(metrics.flatness >= 0 && metrics.flatness <= 1, `flatness out of [0,1]: ${metrics.flatness}`);
  assert.equal(typeof metrics.zcr, 'number', 'zcr is not a number');
  assert.ok(metrics.zcr >= 0, `zcr is negative: ${metrics.zcr}`);
});

test('computeMetrics returns object with snr, flatness, and zcr properties', () => {
  const audioData = createMockAudioData();
  const metrics = computeMetrics(audioData, 44100);

  assert.ok('snr' in metrics, 'snr property missing');
  assert.ok('flatness' in metrics, 'flatness property missing');
  assert.ok('zcr' in metrics, 'zcr property missing');
});
