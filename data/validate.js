function validateRow(values, rowNumber, schema, today) {
  const issues = [];
  const report = (column, code, message) => {
    issues.push({ row: rowNumber, column, code, message, severity: 'error' });
  };

  if (values.length > schema.columns.length) {
    report('(row)', 'bad_format', 'This row contains extra columns.');
  }

  schema.columns.forEach((column, index) => {
    const value = values[index] ?? '';
    if (!value.trim()) {
      report(column.name, 'missing', 'This value is required.');
    } else if (column.type === 'id' && !column.pattern.test(value)) {
      report(column.name, 'bad_format', 'Use R followed by three digits, like R001.');
    } else if (column.type === 'date') {
      if (!column.pattern.test(value) || normalizeDate(value) !== value) {
        report(column.name, 'bad_format', 'Enter a real date in YYYY-MM-DD format.');
      } else if (value > today) {
        report(column.name, 'future_date', 'The evaluation date cannot be after today.');
      }
    } else if (column.type === 'choice' && !column.allowed.includes(value)) {
      report(column.name, 'not_allowed', 'Use one of: ' + column.allowed.join(', ') + '.');
    } else if (column.type === 'integer') {
      if (!/^-?(0|[1-9]\d*)$/.test(value) || value === '-0') {
        report(column.name, 'bad_format', 'Enter a whole number without a percent sign.');
      } else if (Number(value) < column.min || Number(value) > column.max) {
        report(column.name, 'out_of_range', 'Confidence must be between 0 and 100.');
      }
    }
  });
  return issues;
}

function validateFile(rows, schema, today) {
  const [header, ...records] = rows;
  const result = { accepted: [], rejected: [], warnings: [], errors: [] };
  const expected = schema.columns.map(column => column.name);
  if (JSON.stringify(header) !== JSON.stringify(expected)) {
    result.errors.push({
      row: 1, column: '(header)', code: 'bad_header',
      message: 'Expected these columns in order: ' + expected.join(', ') + '.', severity: 'error'
    });
    return result;
  }

  const seen = new Set();
  records.forEach((values, index) => {
    const row = index + 2;
    const errors = validateRow(values, row, schema, today);
    if (errors.length) {
      result.rejected.push({ row, values, errors });
      return;
    }
    const key = JSON.stringify(values);
    if (seen.has(key)) {
      result.warnings.push({
        row, column: '(row)', code: 'possible_duplicate',
        message: 'This row exactly matches an earlier row. Both were loaded.', severity: 'warning'
      });
    }
    seen.add(key);
    result.accepted.push({ row, values });
  });
  return result;
}
