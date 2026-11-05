const reviewSchema = {
  columns: [
    { name: 'result_id', type: 'id', pattern: /^R\d{3}$/ },
    { name: 'evaluated_on', type: 'date', pattern: /^\d{4}-\d{2}-\d{2}$/ },
    { name: 'task', type: 'choice', allowed: ['Classification', 'Summarization', 'Extraction'] },
    { name: 'confidence', type: 'integer', min: 0, max: 100 },
    { name: 'outcome', type: 'choice', allowed: ['Correct', 'Incorrect'] }
  ]
};
