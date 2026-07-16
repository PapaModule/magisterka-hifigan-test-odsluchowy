# Test 2 Implementation — Code Review Findings

**Date:** 2026-07-01  
**Reviewer:** Claude Sonnet 4.6 (Medium Effort)  
**Status:** BLOCKED — Cannot merge until critical issues fixed

---

## Summary

Sonnet found **7 actionable findings**, of which **4 are CRITICAL** (crash/data loss). The implementation cannot be deployed without fixes.

---

## Critical Issues (Must Fix)

### 1. ❌ Import Crash — app-paired.js line 1

**Issue:** app-paired.js imports `CALIBRATION_SAMPLES` and `CLASS_INFO` from `./data-paired.js`, but these are only exported from `./data.js`.

**Fix:** Change import source from `./data-paired.js` to `./data.js`

---

### 2. ❌ Audio 404 — Generated Samples (Filename Mismatch)

**Issue:** GENERATED_TOP_10 uses 2-digit padding (`normal_01.wav`) but actual files use 3-digit padding (`normal_001.wav`).

**Actual files:** normal_001.wav, normal_003.wav, normal_005.wav, ... (46 files, 3-digit)

**Impact:** All 30 generated audio slots will 404.

**Fix:** Update filenames to 3-digit padding, accounting for gaps (001, 003, 005, 006, etc. — not sequential)

---

### 3. ❌ Audio 404 — Real Samples (Path Pattern Mismatch)

**Issue:** Real paths use pattern `{cls}_real_NN.wav` but dataset_exp9 follows different naming.

**Impact:** All 30 real audio slots will 404.

**Fix:** Verify actual filenames in dataset_exp9 symlink and update path pattern accordingly.

---

### 4. ⚠️ Fabricated Metrics — RANKINGS Constant

**Issue:** RANKINGS contains hardcoded "plausible values" instead of computed metrics from actual e200 audio.

**Impact:** The ranking strategy (selecting top-quality samples) is defeated. Research conclusions will be invalid.

**Fix:** Either compute actual rankings from e200 audio or document as placeholder.

---

## High Priority Issues

### 5. 🔧 Duplicate Code — selectPairedTrials

**Issue:** Verbatim copy of shuffle() from logic.js.

**Fix:** Import shuffle from logic.js and reuse it.

---

### 6. 🔧 Resource Leak — AudioContext

**Issue:** rankSamples() creates AudioContext per file but never closes them.

**Impact:** Leaks browser audio contexts; decoding fails after ~6-30 contexts.

**Fix:** Call audioContext.close() after processing each file.

---

### 7. 🔧 Wrong Data — isGenerated Field

**Issue:** buildPayload() hardcodes isGenerated: true for all trials.

**Impact:** Submitted data always marks everything as generated; analytics useless.

**Fix:** Use trial.isGenerated or compute from trial.answer vs correctAnswer.

---

## Next Steps

1. Fix Critical #1, #2, #3 (blocks deployment)
2. Resolve Critical #4 (research validity)
3. Fix High #5, #6, #7 (code quality)
4. Re-test and re-review before merge

**Worktree location:** .claude/worktrees/test2-implementation  
**Branch:** worktree-test2-implementation

