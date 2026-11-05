# Review Balance

A browser simulator that helps teams explore how confidence thresholds affect human review volume and errors that bypass review. Built for Cornell AI Strategy New Member Education.

Live website: [Open Review Balance](https://ms0408choi.github.io/CAIS_NME_Project/)

## How to use
1. Open `index.html` directly in a browser. No installation is needed.
2. Move the slider or enter a whole-number threshold from 0 to 100.
3. Compare human review, auto-passed results, and errors auto-passed. Expand the sample table to inspect individual results.

Below the threshold means human review; otherwise, auto-pass. At 0%, review none. At 100%, review all. Reset returns to 70%. The fixed sample contains 100 invented results; at 70%, 70 need review, 30 auto-pass, and 3 incorrect results auto-pass.

## Requirements
1. Changing the threshold immediately updates review, auto-pass, and unchecked-error counts.
2. At 0%, all results auto-pass; at 100%, all results go to human review.
3. Raising the threshold never decreases review volume or increases unchecked errors on the same sample.

## Tests
The first three test rows correspond to requirements 1–3.
The student confirmed the simulator appeared in the browser and reported correct results at 70%, 80%, 0%, and 100%, rejection of blank, -1, 12.5, and 101 with unchanged counts, and reset to 70%. Additional JavaScript checks used a lightweight simulated document. The student also confirmed the published site works on a phone.

| # | Kind | Action | Expected | Observed | Result |
|---|---|---|---|---|---|
| 1 | Normal / Requirement 1 | Change slider to 80% | 80 reviewed, 20 auto-passed, 0 errors auto-passed | Counts matched in automated check and student browser check | Pass |
| 2 | Edge / Requirement 2 | Set 0%, then 100% | At 0%: 0 reviewed / 100 passed / 52 errors. At 100%: 100 reviewed / 0 passed / 0 errors | Both endpoints matched in automated and student browser checks | Pass |
| 3 | Edge / Requirement 3 | Check every integer threshold from 0 to 100 | Review never decreases; unchecked errors never increase; review + auto-pass = 100 | All 101 thresholds satisfied these rules in JavaScript checks | Pass |
| 4 | Normal | Click Reset to 70% after changing the threshold | Threshold 70%; 70 reviewed / 30 passed / 3 errors; validation message cleared | Matched in automated check and student browser check | Pass |
| 5 | Wrong input | Enter blank, -1, 101, 12.5, or nonnumeric text | Friendly message; last valid counts remain | All listed inputs passed the automated check; student confirmed blank, -1, 12.5, and 101 in the browser | Pass |

Reset was checked automatically and confirmed by the student in the browser: threshold returns to 70% and clears the validation message. Real number inputs may reject letters before the input handler sees them; an empty value is handled safely.

### Additional optional checks
- Verify tiles and table match the counts.
- Try nonnumeric input in the browser; the number field may prevent letters from being entered.

## Limits
Scores and outcomes are invented, not a calibrated model or representative production dataset. Confidence does not guarantee correctness. Human reviewers may make mistakes; this tool does not simulate their accuracy or final errors after review. It is a learning tool, not a recommendation for a production threshold. No personal data, accounts, server, or external AI service is used. Threshold resets on reload.

## Build log
- Asked to define a small AI review simulator; wrote a project sentence and three requirements, then checked each was measurable.
- Asked for agent instructions and a hello page; created both, and the student checked the page in a browser and pushed the first commit.
- Asked to build version 1; added threshold controls, totals, and sample results. JavaScript checks and student browser checks confirmed expected counts, boundaries, reset, and invalid-input behavior.
- Asked to document and publish; wrote the test table and limits. Automated local-file browser access was blocked, so the student checked the browser and confirmed the published site worked on a phone.
- Tried a compact dashboard and comparison chart. Automated checks passed, and the student chose to keep the original design for submission.

## Changes
- Added `AGENTS.md` with the assignment's static-site rules.
- Built the simulator with plain HTML, CSS, and JavaScript.
- Added threshold controls, three totals, a routing bar, 100 result tiles, and a detailed table.
- Documented the sample, limitations, tests, and remaining manual checks.

## Data cleaning

The practice CSV contains fictional AI results. Keep `data/raw.csv` as the original. Open `data/clean.html` in a browser, click **Run cleaning**, and choose `raw.csv` to see the row check and download the cleaned copy.

| Problem | Raw rows (header is row 1) | Decision |
|---|---|---|
| Mixed date formats | 4, 14 | Convert to YYYY-MM-DD. Slash dates use US month/day order in this practice export. |
| Percent sign | 5 | Convert 76% to 76 on the 0–100 scale. |
| Inconsistent capitalization | 6, 15 | Use Summarization and Correct. |
| Missing confidence or outcome | 8, 19 | Set aside for review. |
| Repeated result | 10 | Remove the confirmed duplicate and keep row 9. |
| Confidence above 100 | 11 | Set aside for review. |
| Incorrect result at 100 confidence | 12 | Keep. Confidence does not establish correctness. |
| Future evaluation date | 17 | Set aside for review. Use November 4, 2026 as the practice cutoff. |
| Export summary | 26 | Remove. |

The JavaScript row check passed: **25 raw = 19 clean + 2 removed + 4 set aside**. Every source row appears once across the three groups. The checked-in clean CSV contains only the five data columns.
