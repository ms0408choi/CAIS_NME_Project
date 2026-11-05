// Fixed, invented scores (1–99) and known outcomes; these are not model predictions.
const sample = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  confidence: ((i * 37 + 13) % 99) + 1,
  correct: ((i * 53 + 29) % 100) < ((i * 37 + 13) % 99) + 1
}));
let activeResults = sample;

function simulate(threshold) {
  const results = activeResults.map(item => ({ ...item, review: threshold === 100 || item.confidence < threshold }));
  const review = results.filter(item => item.review).length;
  const errors = results.filter(item => !item.review && !item.correct).length;
  return { results, review, passed: activeResults.length - review, errors };
}
const number = document.getElementById('threshold');
const slider = document.getElementById('slider');
const error = document.getElementById('error');
function render(threshold) {
  const state = simulate(threshold);
  number.value = threshold;
  slider.value = threshold;
  error.textContent = '';
  number.removeAttribute('aria-invalid');
  const total = state.results.length;
  document.getElementById('result-count').textContent = total;
  document.getElementById('dataset-title').textContent =
    activeResults === sample ? '100 simulated AI results' : total + ' imported AI results';
  document.getElementById('review').textContent = state.review;
  document.getElementById('passed').textContent = state.passed;
  document.getElementById('errors').textContent = state.errors;
  document.getElementById('policy').textContent = threshold === 100 ? `All ${total} results go to human review.` : threshold === 0 ? `All ${total} results auto-pass without human review.` : `Confidence below ${threshold}% → human review. Confidence of ${threshold}% or higher → auto-pass.`;
  document.getElementById('summary').textContent = `${state.review} results need a person’s attention. ${state.errors} of the ${state.passed} auto-passed results are incorrect.`;
  document.getElementById('review-bar').style.width = `${state.review / total * 100}%`;
  document.getElementById('pass-bar').style.width = `${(state.passed - state.errors) / total * 100}%`;
  document.getElementById('error-bar').style.width = `${state.errors / total * 100}%`;
  document.getElementById('grid').innerHTML = state.results.map(item => `<div class="tile ${item.review ? 'review' : item.correct ? 'pass' : 'error'}"></div>`).join('');
  document.getElementById('rows').innerHTML = state.results.map(item => `<tr><td>#${typeof item.id === 'number' ? String(item.id).padStart(3, '0') : item.id}</td><td>${item.confidence}%</td><td>${item.correct ? 'Correct' : 'Incorrect'}</td><td>${item.review ? 'Human review' : 'Auto-pass'}</td></tr>`).join('');
}
number.addEventListener('input', () => {
  const raw = number.value.trim();
  const value = Number(raw);
  if (raw === '' || !Number.isInteger(value) || value < 0 || value > 100) {
    error.textContent = 'Enter a whole number from 0 to 100. Results still show the last valid threshold.';
    number.setAttribute('aria-invalid', 'true');
    return;
  }
  render(value);
});
slider.addEventListener('input', () => render(Number(slider.value)));
document.getElementById('reset').addEventListener('click', () => render(70));
render(70);

const importFile = document.getElementById('import-file');
const importButton = document.getElementById('import-button');
const importStatus = document.getElementById('import-status');
const importIssues = document.getElementById('import-issues');
const useSample = document.getElementById('use-sample');

function todayForImport() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function importResults(text, today) {
  const rows = parseCSV(text.replace(/^\uFEFF/, ''));
  const report = validateFile(rows, reviewSchema, today);
  const results = report.accepted.map(({ values }) => ({
    id: values[0],
    confidence: Number(values[3]),
    correct: values[4] === 'Correct'
  }));
  return { report, results };
}

importButton.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  if (!file) return;
  importButton.disabled = true;
  useSample.disabled = true;
  importIssues.replaceChildren();
  importIssues.hidden = true;

  try {
    const { report, results } = importResults(await file.text(), todayForImport());
    const issues = [...report.errors, ...report.rejected.flatMap(row => row.errors), ...report.warnings];
    for (const issue of issues) {
      const item = document.createElement('li');
      const prefix = issue.severity === 'warning' ? 'Possible duplicate. ' : '';
      item.textContent = `Row ${issue.row}, ${issue.column}: ${prefix}${issue.message}`;
      importIssues.append(item);
    }
    importIssues.hidden = issues.length === 0;
    if (results.length > 0) {
      activeResults = results;
      useSample.hidden = false;
      render(Number(slider.value));
    }
    const rejected = report.errors.length ? 'File rejected. ' : '';
    const kept = results.length ? '' : ' The previous dataset is still in use.';
    importStatus.textContent = `${rejected}${results.length} rows loaded, ${report.rejected.length} rows rejected, ${report.warnings.length} duplicate warnings.${kept}`;
  } catch (error) {
    importStatus.textContent = 'Could not read this CSV. ' + error.message + ' The previous dataset is still in use.';
  } finally {
    importFile.value = '';
    importButton.disabled = false;
    useSample.disabled = false;
  }
});

useSample.addEventListener('click', () => {
  activeResults = sample;
  useSample.hidden = true;
  importIssues.replaceChildren();
  importIssues.hidden = true;
  importStatus.textContent = 'Using the built-in sample of 100 results.';
  render(Number(slider.value));
});
