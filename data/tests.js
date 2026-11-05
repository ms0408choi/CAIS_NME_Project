const testToday = '2026-11-04';
const goodRow = ['R001', '2026-10-28', 'Classification', '92', 'Correct'];

function rowIssues(values) {
  return validateRow(values, 7, reviewSchema, testToday)
    .map(issue => [issue.row, issue.column, issue.code, issue.severity]);
}

function fileCounts(result) {
  return [result.accepted.length, result.rejected.length, result.warnings.length];
}

const dataTests = [
  ['A valid result passes', [], () => rowIssues(goodRow)],
  ['All blank columns are reported', goodRow.map((_, i) => [7, reviewSchema.columns[i].name, 'missing', 'error']),
    () => rowIssues(['', '', '', '', ''])],
  ['Result ID uses R and three digits', [[7, 'result_id', 'bad_format', 'error']],
    () => rowIssues(['1', ...goodRow.slice(1)])],
  ['Slash dates are rejected', [[7, 'evaluated_on', 'bad_format', 'error']],
    () => rowIssues(['R001', '10/28/2026', ...goodRow.slice(2)])],
  ['Impossible dates are rejected', [[7, 'evaluated_on', 'bad_format', 'error']],
    () => rowIssues(['R001', '2026-02-30', ...goodRow.slice(2)])],
  ['Future dates are rejected', [[7, 'evaluated_on', 'future_date', 'error']],
    () => rowIssues(['R001', '2026-11-05', ...goodRow.slice(2)])],
  ['Task labels are case-sensitive', [[7, 'task', 'not_allowed', 'error']],
    () => rowIssues(['R001', goodRow[1], 'classification', '92', 'Correct'])],
  ['Confidence cannot contain a percent sign', [[7, 'confidence', 'bad_format', 'error']],
    () => rowIssues(['R001', goodRow[1], goodRow[2], '76%', 'Correct'])],
  ['Confidence cannot exceed 100', [[7, 'confidence', 'out_of_range', 'error']],
    () => rowIssues(['R001', goodRow[1], goodRow[2], '112', 'Correct'])],
  ['Zero and 100 are valid even for incorrect results', [[], []],
    () => ['0', '100'].map(score => rowIssues(['R001', goodRow[1], goodRow[2], score, 'Incorrect']))],
  ['Outcome must be Correct or Incorrect', [[7, 'outcome', 'not_allowed', 'error']],
    () => rowIssues([...goodRow.slice(0, 4), 'CORRECT'])],
  ['An extra column is rejected', [[7, '(row)', 'bad_format', 'error']],
    () => rowIssues([...goodRow, 'extra'])],
  ['A wrong header stops import', [0, 'bad_header'],
    () => {
      const result = validateFile([['id'], goodRow], reviewSchema, testToday);
      return [result.accepted.length, result.errors[0]?.code];
    }],
  ['An exact duplicate loads with a warning', [2, 0, 1, 3, 'possible_duplicate'],
    () => {
      const result = validateFile([reviewSchema.columns.map(column => column.name), goodRow, goodRow], reviewSchema, testToday);
      return [...fileCounts(result), result.warnings[0]?.row, result.warnings[0]?.code];
    }],
  ['Raw CSV reports its rejected rows and duplicate', [15, 10, 1, [4, 5, 6, 8, 11, 14, 15, 17, 19, 26]],
    () => {
      const result = validateFile(parseCSV(rawFixture), reviewSchema, testToday);
      return [...fileCounts(result), result.rejected.map(row => row.row)];
    }],
  ['Clean CSV loads all 19 rows', [19, 0, 0],
    () => fileCounts(validateFile(parseCSV(cleanFixture), reviewSchema, testToday))]
];

function runDataTests() {
  return dataTests.map(([name, expected, run]) => {
    try {
      const actual = run();
      return { name, expected, actual, passed: JSON.stringify(actual) === JSON.stringify(expected) };
    } catch (error) {
      return { name, expected, actual: error.message, passed: false };
    }
  });
}
