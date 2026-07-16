# Test 2 (A/B Pairing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to execute task-by-task.

**Goal:** Implement Test 2 (A/B Pairing) — paired audio comparison listening test where participants identify which of two samples (one real, one generated from e200) is generated, using curated top-ranked samples.

**Architecture:** Reuse Test 1 infrastructure (survey, calibration, Google Sheets) with new paired trial data structure. Implement metrics-based ranking to select top-quality generated samples. Build data layer for paired trials and UI for two-sample playback.

**Tech Stack:** JavaScript (ES6 modules), Node.js test runner, WAV audio, Google Apps Script

## Global Constraints

- **Pool size:** 30 trials (10 per class: normal, murmur, extrastole)
- **Trial format:** fileA=real (dataset_exp9), fileB=generated (e200), correctAnswer='B'
- **Ranking:** SNR↑ flatness↓ ZCR↓
- **UI:** Same as test1.html (theme-demo.css)
- **Sheets:** New sheet "Wyniki Test 2"
- **Detection:** Use testVersion: 2 in payload

---

## Task 1: Implement Metrics (SNR, Flatness, ZCR)

**Files:**
- Create: `js/rank-generated.js`, `js/rank-generated.test.js`

- [ ] Write failing test for computeSNR
- [ ] Implement metrics (SNR, flatness, ZCR, ranking, selectTop)
- [ ] Add tests for flatness, ZCR, ranking
- [ ] Run tests (PASS expected)
- [ ] Commit

---

## Task 2: Create rankings.json

**Files:**
- Create: `audio/test-paired/rankings.json`

- [ ] Generate rankings.json with top 10 per class
- [ ] Verify JSON validity
- [ ] Commit

---

## Task 3: Create data-paired.js Trial Pool

**Files:**
- Create: `js/data-paired.js`, `js/data-paired.test.js`

- [ ] Implement PAIRED_TRIAL_POOL (30 trials)
- [ ] Implement selectPairedTrials, scorePairedTrial
- [ ] Add unit tests (pool size, uniqueness, class dist, shuffling)
- [ ] Run tests (PASS expected)
- [ ] Commit

---

## Task 4: Create test3.html

**Files:**
- Create: `test3.html`

- [ ] Create HTML entry point (loads app-paired.js)
- [ ] Verify file created
- [ ] Commit

---

## Task 5: Create app-paired.js

**Files:**
- Create: `js/app-paired.js`

- [ ] Implement createApp, state machine
- [ ] Implement screen rendering: welcome, survey, calibration, test, summary
- [ ] Load two audio files per trial (fileA, fileB)
- [ ] Randomize A/B position left/right
- [ ] Score answers (answer === correctAnswer)
- [ ] Submit to GAS with testVersion: 2
- [ ] Commit

---

## Task 6: Update google-apps-script.gs

**Files:**
- Modify: `google-apps-script.gs`

- [ ] Add testVersion detection
- [ ] Create "Wyniki Test 2" sheet if missing
- [ ] Write to correct sheet based on version
- [ ] Commit

---

## Task 7: End-to-End Testing

- [ ] Start http.server
- [ ] Open test3.html, complete full flow (welcome→survey→calibration→trials→summary)
- [ ] Verify audio plays
- [ ] Verify A/B randomization
- [ ] Verify submission to "Wyniki Test 2" sheet
- [ ] Commit

---

**Estimated effort:** 3–4 hours

