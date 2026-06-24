# Test 2 (A/B Pairing) — Design Specification

**Date:** 2026-06-24  
**Status:** Design Approved  
**Version:** 1.0

---

## Executive Summary

Second listening test where participants hear two audio samples (one real, one generated) and identify which is generated. Uses same infrastructure as Test 1 (survey, calibration, Google Sheets submission) but with distinct data source and methodology.

**Key Differences from Test 1:**
- Test 1: Single sample → "real or generated?" (random sampling of generated samples)
- Test 2: Paired samples (real + generated) → "which is generated?" (curated selection of generated samples)
- Test 1 uses e95 checkpoint; Test 2 uses e200 checkpoint
- Test 2 is a **best-case ceiling test** (deliberately selected high-quality generated samples) vs Test 1's random baseline

---

## Architecture

### File Structure

```
magisterka-test-odsluchowy/
├── test3.html                    # New HTML entry point (same look as test1)
├── js/
│   ├── app.js                    # Reuse (no changes)
│   ├── logic.js                  # Reuse (no changes)
│   ├── data-paired.js            # NEW: Paired trial pool + ranking logic
│   ├── rank-generated.js         # NEW: Metrics computation (SNR, flatness, ZCR)
│   ├── data-paired.test.js       # NEW: Unit tests
│   └── rank-generated.test.js    # NEW: Unit tests
├── css/
│   └── theme-demo.css            # Reuse (same as test1)
├── audio/
│   └── test-paired/              # NEW: Symlink or mirror to e200
│       ├── real/                 # Symlink to dataset_exp9
│       └── generated/            # Mirror of e200 selection
└── docs/superpowers/specs/
    └── 2026-06-24-test2-ab-pairing-design.md (this file)
```

### Data Sources

**Real samples:** `/Magisterka_hifigan/dataset_exp9/{class}/`
- normal: 22,210 samples (randomly select 10)
- murmur: 20,782 samples (randomly select 10)
- extrastole: 64 samples (randomly select 10)

**Generated samples:** `/Magisterka_hifigan/output_hifigan_exp9/eval_samples/epoch_0200/{class}/`
- normal: 47 samples (rank by SNR↑ + flatness↓ → select top 10)
- murmur: 50 samples (rank by SNR↑ + clarity → select top 10)
- extrastole: 50 samples (rank by SNR↑ + plausibility → select top 10)

---

## Data Format

### PAIRED_TRIAL_POOL

Each trial is a paired comparison:

```javascript
{
  id: 'paired_normal_01',           // Unique identifier
  class: 'normal',                  // One of: normal, murmur, extrastole
  fileA: '/path/to/real/normal_XXXX.wav',           // Real from dataset_exp9
  fileB: '/path/to/generated/normal_YYYY.wav',      // Generated from e200
  correctAnswer: 'B',               // Which one is generated
  ranking: {
    snr: 18.5,                      // dB
    flatness: 0.042,                // 0–1 scale
    zcr: 0.051                      // Zero crossing rate
  }
}
```

**Pool size:** 30 trials total (10 per class)

**Randomization:** Left/right position (fileA/fileB) randomized per trial during test creation.

---

## Ranking Strategy

### SNR (Signal-to-Noise Ratio)

```
SNR = 20 * log10(signal_rms / noise_floor_rms)
```

- Higher SNR = cleaner, more realistic
- Computed on 100ms frames; noise floor = 10th percentile frame RMS

### Spectral Flatness (Wiener Entropy)

```
flatness ∈ [0, 1]
  0 = tonal / harmonic (sinus-like)
  1 = white noise
```

- For all classes: lower flatness = more structured, realistic heartbeat
- Generated samples tend toward higher flatness (noisier)

### Zero Crossing Rate (ZCR)

```
zcr = mean(zero_crossings_per_frame)
```

- Higher ZCR = more noise/artifacts/distortion
- Secondary metric; lower is better

### Per-Class Selection Criteria

| Class       | Primary Criterion      | Secondary       | Goal                          |
|-------------|------------------------|-----------------|-------------------------------|
| **normal**  | max SNR, min flatness  | min ZCR         | Regular, clean heartbeat      |
| **murmur**  | balanced SNR/flatness  | clarity (?)     | Clear, recognizable murmur    |
| **extrastole** | max SNR              | min flatness    | Plausible, clean extra beat   |

---

## UI & UX

### test3.html Entry Point

- Visual style: identical to `test1.html` (uses `theme-demo.css`)
- Same flow: Welcome → Survey → Calibration → Test → Summary
- Test step renders two audio players labeled **"Audio A"** and **"Audio B"** (or "Lewy" / "Prawy")

### Answer Options

Instead of "Real / Generated":
- Button A: "To jest wygenerowane" (This one is generated)
- Button B: "To jest wygenerowane" (This one is generated)

UI logic: determine which button was clicked, map to fileA or fileB, check against `correctAnswer`.

---

## Results & Google Sheets Integration

### New Sheet Name

Google Apps Script writes to sheet: **`"Wyniki Test 2"`** (not `"Wyniki"` from Test 1)

### Column Structure (same as Test 1)

| Column | Content |
|--------|---------|
| timestamp | ISO 8601 |
| ageRange | e.g., "18–25" |
| audioExperience | e.g., "profesjonalista" |
| equipment | e.g., "słuchawki" |
| medicalExperience_hasExperience | true/false |
| medicalExperience_details | Free text |
| trialIndex | 0–29 |
| trialId | e.g., "paired_normal_01" |
| class | "normal" / "murmur" / "extrastole" |
| isGenerated | true/false |
| answer | "A" or "B" |
| correct | true/false |

### Webhook & Submission

- Reuse existing GAS webhook URL from `js/app.js`
- Modify `google-apps-script.gs` to detect payload source (Test 1 vs Test 2) and write to correct sheet
  - Detection: check for `"paired"` in trial IDs, or add explicit `testVersion: 2` field to payload

---

## Scoring & Analysis

**Per-trial correctness:**
- `correct = (answer === correctAnswer)`

**Aggregation:**
- Per-class accuracy (normal / murmur / extrastole)
- Overall accuracy (x/30)
- Comparison with Test 1 results (same participant, both tests)

---

## Testing

### Unit Tests (`data-paired.test.js`)

- ✓ Trial pool has exactly 30 trials (10 per class)
- ✓ Each trial has unique `id`
- ✓ `fileA` and `fileB` are valid paths
- ✓ `correctAnswer` is "A" or "B"
- ✓ All three classes represented
- ✓ Randomization (selectPairedTrials) produces shuffled order
- ✓ Trial selection respects class distribution

### Unit Tests (`rank-generated.test.js`)

- ✓ SNR calculation produces realistic values (e.g., 10–25 dB)
- ✓ Flatness in [0, 1]
- ✓ ZCR > 0
- ✓ Ranking by SNR + flatness sorts correctly
- ✓ Top-N selection returns expected count

### Integration (Manual)

- ✓ test3.html loads without errors
- ✓ Survey completes
- ✓ Calibration plays audio samples correctly
- ✓ Test loop: 30 trials render, audio plays, answers recorded
- ✓ Summary shows score (x/30)
- ✓ Results submit to Google Sheets → "Wyniki Test 2" sheet
- ✓ Email notification triggered

---

## Implementation Scope

**Phase 1: Core Data & Logic**
- Create `rank-generated.js` (metrics + ranking)
- Create `data-paired.js` (trial pool generation)
- Unit tests

**Phase 2: UI & Integration**
- Create `test3.html`
- Adapt `app.js` flow for paired trials (minimal changes, mostly config)
- CSS styling (reuse `theme-demo.css`)

**Phase 3: Backend & Deployment**
- Update `google-apps-script.gs` to handle two test versions
- Manual deployment & testing

---

## Methodology Note

Test 2 is a **best-case/ceiling test**:
- Test 1 uses *random* sampling of generated samples (realistic real-world baseline)
- Test 2 uses *curated, top-ranked* generated samples (best-case scenario)

This is a deliberate design choice to measure: "When the model produces its best examples, how close to imperceptible are they?" vs. "On average, how detectable are generated samples?"

Both are valid research questions; the distinction must be clearly documented in the thesis.

---

## Open Questions / TBD

- ☐ How to handle murmur ranking? Is SNR/flatness sufficient, or do we need domain expertise review?
- ☐ Should test3.html link/redirect to test2.html as an alternative, or be completely separate?
- ☐ Email notification: should it mention "Test 2" explicitly so results don't mix?

---

## Sign-Off

- **Designer:** Claude (brainstorming skill)
- **Approved by:** User (2026-06-24)
