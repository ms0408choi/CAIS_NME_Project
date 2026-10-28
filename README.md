# Review Balance

A browser simulator that helps teams explore how confidence thresholds affect human review volume and errors that bypass review. Built for Cornell AI Strategy New Member Education.

Live website: [Open Review Balance](https://ms0408choi.github.io/CAIS_NME_Project/)

## How to use
1. Open `index.html` directly in a browser. No installation is needed.
2. Move the slider or enter a whole-number threshold from 0 to 100.
3. Compare human review, auto-passed results, and errors auto-passed. Expand the sample table to inspect individual results.

Below the threshold means human review; otherwise, auto-pass. At 0%, review none. At 100%, review all. Reset returns to 70%. The fixed sample contains 100 invented results; at 70%, 70 need review, 30 auto-pass, and 3 incorrect results auto-pass.

## Tests
The student confirmed the simulator appeared in the browser and reported correct results at 70%, 80%, 0%, and 100%, rejection of blank, -1, 12.5, and 101 with unchanged counts, and reset to 70%. Additional JavaScript checks used a lightweight simulated document. The student also confirmed the published site works on a phone.

| # | Kind | Action | Expected | Observed | Result |
|---|---|---|---|---|---|
| 1 | Normal | Change slider to 80% | 80 reviewed, 20 auto-passed, 0 errors auto-passed | Counts matched in automated check and student browser check | Pass |
| 2 | Edge | Set 0% | 0 reviewed, 100 auto-passed, 52 errors auto-passed | Counts matched in automated check and student browser check | Pass |
| 3 | Edge | Set 100% | 100 reviewed, 0 auto-passed, 0 errors auto-passed | Counts matched in automated check and student browser check | Pass |
| 4 | Edge | Check every integer threshold from 0 to 100 | Review never decreases; unchecked errors never increase; review + auto-pass = 100 | All 101 thresholds satisfied these rules | Pass |
| 5 | Wrong input | Enter blank, -1, 101, 12.5, or nonnumeric text | Friendly message; last valid counts remain | All listed inputs passed the automated check; student confirmed blank, -1, 12.5, and 101 in the browser | Pass |

Reset was checked automatically and confirmed by the student in the browser: threshold returns to 70% and clears the validation message. Real number inputs may reject letters before the input handler sees them; an empty value is handled safely.

### Additional optional checks
- Verify tiles and table match the counts.
- Try nonnumeric input in the browser; the number field may prevent letters from being entered.

## Limits
Scores and outcomes are invented, not a calibrated model or representative production dataset. Confidence does not guarantee correctness. Human reviewers may make mistakes; this tool does not simulate their accuracy or final errors after review. It is a learning tool, not a recommendation for a production threshold. No personal data, accounts, server, or external AI service is used. Threshold resets on reload.

## Build log
- Defined the project and three measurable requirements.
- Created agent instructions and a hello page; the student confirmed the page appeared in a browser.
- The student reported committing and pushing the hello page through GitHub Desktop.
- Replaced the hello page with a responsive simulator, a fixed sample, validation, and an inspectable result table.
- Checked calculations and handlers across all thresholds and invalid inputs. Automated browser access to the local file was blocked. The student then confirmed the simulator appeared and the browser cases above worked. The student also confirmed the published site works on a phone.

The student subsequently confirmed blank, negative, and fractional input validation in the browser.

## Changes
- Added `AGENTS.md` with the assignment's static-site rules.
- Built the simulator with plain HTML, CSS, and JavaScript.
- Added threshold controls, three totals, a routing bar, 100 result tiles, and a detailed table.
- Documented the sample, limitations, tests, and remaining manual checks.
