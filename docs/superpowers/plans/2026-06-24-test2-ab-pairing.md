# Test 2 (A/B Pairing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement second listening test where participants hear paired real+generated audio samples and identify which is generated; curated selection from e200 checkpoint; results to new "Wyniki Test 2" Google Sheet.

**Architecture:** Modular approach — audio metrics (`rank-generated.js`) + trial generation (`data-paired.js`) + test UI (`test3.html`) + backend integration (Google Apps Script). All code reuses existing Test 1 infrastructure (survey, calibration, app.js engine). No refactoring of Test 1 code.

**Tech Stack:** Vanilla JavaScript (ES6 modules), Web Audio API (librosa-equivalent metrics in JS), Google Apps Script.

## Global Constraints

- Paired trials: exactly 30 (10 per class: normal, murmur, extrastole)
- Real samples: randomly drawn from `dataset_exp9/{class}/`
- Generated samples: top 10 ranked by SNR + flatness from `eval_samples/epoch_0200/{class}/`
- UI: identical visual style to test1.html (theme-demo.css)
- Google Sheets: new sheet name = `"Wyniki Test 2"` (not `"Wyniki"`)
- All trials must have unique `id`, valid file paths, correct `correctAnswer` ("A" or "B")

---

## File Structure

**New files:**
- `js/rank-generated.js` — Metrics computation (SNR, flatness, ZCR)
- `js/rank-generated.test.js` — Unit tests for metrics
- `js/data-paired.js` — Trial pool generation + ranking logic
- `js/data-paired.test.js` — Unit tests for trial selection
- `test3.html` — Entry point (paired test variant)
- `js/app-paired.js` — Copy of app.js with paired data imports

**Modified files:**
- `google-apps-script.gs` — Add logic to detect Test 2 payloads
- `css/theme-demo.css` — Add paired-players styles
- `audio/test-paired/` — Symlink/mirror to e200 + dataset_exp9

**Reused files:**
- `js/app.js`, `js/logic.js`, `package.json` — No changes

---

## Tasks Summary

1. **Task 1:** Set up audio directory structure (3 steps)
2. **Task 2:** Implement rank-generated.js with metrics (6 steps)
3. **Task 3:** Implement data-paired.js with trial pool (7 steps)
4. **Task 4:** Create test3.html and app-paired.js (9 steps)
5. **Task 5:** Update google-apps-script.gs (6 steps)
6. **Task 6:** Pre-compute rankings (4 steps)
7. **Task 7:** Manual E2E testing (7 steps)

---

[Full task details follow in complete plan document...]
