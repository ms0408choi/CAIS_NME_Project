// Fixed, invented scores (1–99) and known outcomes; these are not model predictions.
const sample = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  confidence: ((i * 37 + 13) % 99) + 1,
  correct: ((i * 53 + 29) % 100) < ((i * 37 + 13) % 99) + 1
}));
function simulate(threshold) {
  const results = sample.map(item => ({ ...item, review: threshold === 100 || item.confidence < threshold }));
  const review = results.filter(item => item.review).length;
  const errors = results.filter(item => !item.review && !item.correct).length;
  return { results, review, passed: sample.length - review, errors };
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
  document.getElementById('review').textContent = state.review;
  document.getElementById('passed').textContent = state.passed;
  document.getElementById('errors').textContent = state.errors;
  document.getElementById('policy').textContent = threshold === 100 ? 'All 100 results go to human review.' : threshold === 0 ? 'All 100 results auto-pass without human review.' : `Confidence below ${threshold}% → human review. Confidence of ${threshold}% or higher → auto-pass.`;
  document.getElementById('summary').textContent = `${state.review} results need a person’s attention. ${state.errors} of the ${state.passed} auto-passed results are incorrect.`;
  document.getElementById('review-bar').style.width = `${state.review}%`;
  document.getElementById('pass-bar').style.width = `${state.passed - state.errors}%`;
  document.getElementById('error-bar').style.width = `${state.errors}%`;
  document.getElementById('grid').innerHTML = state.results.map(item => `<div class="tile ${item.review ? 'review' : item.correct ? 'pass' : 'error'}"></div>`).join('');
  document.getElementById('rows').innerHTML = state.results.map(item => `<tr><td>#${String(item.id).padStart(3, '0')}</td><td>${item.confidence}%</td><td>${item.correct ? 'Correct' : 'Incorrect'}</td><td>${item.review ? 'Human review' : 'Auto-pass'}</td></tr>`).join('');
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
