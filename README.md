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
| 6 | Data | Import `data/clean.csv` | 19 loaded, 0 rejected, 0 duplicate warnings | Counts matched in automated and student browser checks | Pass |
| 7 | Data | Import `data/raw.csv` | 15 loaded, 10 rejected with reasons, one duplicate warning on row 10 | Counts matched in automated and student browser checks. The automated check also verified the duplicate and the out-of-range confidence on row 11. | Pass |
| 8 | Data | Import a one-row CSV with confidence 112 | 0 loaded, 1 rejected with a range error. Keep the previous dataset. | Counts and dataset retention matched in an automated import check | Pass |

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

- Added CSV validation and import. The student confirmed the browser tests page showed 16 passing checks. Automated import checks covered the raw file, the clean file, and a file with only an invalid row. The student imported both practice files in the browser and confirmed the expected counts.

## Changes
- Added `AGENTS.md` with the assignment's static-site rules.
- Built the simulator with plain HTML, CSS, and JavaScript.
- Added threshold controls, three totals, a routing bar, 100 result tiles, and a detailed table.
- Documented the sample, limitations, tests, and remaining manual checks.

## Data

The practice CSV contains fictional AI results generated for this project. Keep `data/raw.csv` as the original. Open `data/clean.html` in a browser, click **Run cleaning**, and choose `raw.csv` to see the row check and download the cleaned copy.

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

### Data contract

The CSV header must match these columns in order. Every field is required.

| Column | Rule |
|---|---|
| `result_id` | R followed by three digits, such as R001 |
| `evaluated_on` | A real date in YYYY-MM-DD format, no later than the date supplied to the validator |
| `task` | Exactly Classification, Summarization, or Extraction |
| `confidence` | A whole number from 0 to 100, without a percent sign or leading zeros |
| `outcome` | Exactly Correct or Incorrect |

Validation rejects a row with errors and lists each issue by row number and column. An exact duplicate of a valid row is accepted with a warning.

Open `data/tests.html` in a browser to run the checks. After publishing version 2, the same page will be available at [Data tests on GitHub Pages](https://ms0408choi.github.io/CAIS_NME_Project/data/tests.html). All 16 passed in a JavaScript run using a fixed cutoff of November 4, 2026. The raw CSV had 15 accepted rows, 10 rejected rows, and one duplicate warning. The cleaned CSV had 19 accepted rows and no rejections or warnings.

Use **Import CSV** on the simulator to load valid rows from a practice file. Use **Use sample data** to return to the built-in results. An import with no valid rows leaves the current dataset in place.
