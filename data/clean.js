// Read CSV fields, including quoted commas, escaped quotes, and quoted line breaks.
function parseCSV(text) {
  const rows = [];
  let fields = [];
  let field = '';
  let quoted = false;
  let closed = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else {
        field += char;
      }
    } else if (char === ',' || char === '\n' || char === '\r') {
      fields.push(field);
      field = '';
      closed = false;
      if (char !== ',') {
        rows.push(fields);
        fields = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      }
    } else if (char === '"' && field === '' && !closed) {
      quoted = true;
    } else {
      if (closed || char === '"') throw new Error('Unexpected character near a quoted CSV field.');
      field += char;
    }
  }
  if (quoted) throw new Error('A quoted CSV field is missing its closing quote.');
  if (field || fields.length || closed) rows.push([...fields, field]);
  return rows;
}

const CLEAN_HEADER = ['result_id', 'evaluated_on', 'task', 'confidence', 'outcome'];
const MANUAL_DECISIONS = {
  10: 'Same result ID and identical contents as row 9. Keep the first copy.'
};

function normalizeDate(text) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  // This practice export uses US month/day/year for slash dates.
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  const named = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}) (\d{4})$/.exec(text);
  let parts;
  if (iso) parts = iso.slice(1);
  if (slash) parts = [slash[3], slash[1], slash[2]];
  if (named) {
    const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
    parts = [named[3], String(months.indexOf(named[1]) + 1), named[2]];
  }
  if (!parts) return null;
  const date = parts.map((part, index) => index ? part.padStart(2, '0') : part).join('-');
  const parsed = new Date(date);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : null;
}

function parseConfidence(text) {
  if (!/^\d+%?$/.test(text)) return null;
  const value = Number(text.replace(/%$/, ''));
  return value <= 100 ? value : null;
}

function normalizeLabel(text, allowed) {
  return allowed.find(label => label.toLowerCase() === text.trim().toLowerCase()) ?? null;
}

function isTotalsRow(row) {
  return row[0] === 'TOTAL';
}

function cleanRows(rows) {
  const result = { clean: [], removed: [], review: [] };
  rows.forEach((values, index) => {
    const source_row = index + 2;
    const record = { source_row, values };
    if (isTotalsRow(values)) {
      result.removed.push({ ...record, reason: 'Export summary, not an AI result.' });
      return;
    }
    const original = rows[index - 1];
    if (MANUAL_DECISIONS[source_row] && original && JSON.stringify(original) === JSON.stringify(values)) {
      result.removed.push({ ...record, reason: MANUAL_DECISIONS[source_row] });
      return;
    }
    const [id, dateText = '', taskText = '', confidenceText = '', outcomeText = ''] = values;
    const date = normalizeDate(dateText);
    const task = normalizeLabel(taskText, ['Classification', 'Summarization', 'Extraction']);
    const confidence = parseConfidence(confidenceText);
    const outcome = normalizeLabel(outcomeText, ['Correct', 'Incorrect']);
    const reasons = [];
    if (values.length !== CLEAN_HEADER.length) reasons.push('Expected five columns.');
    if (!/^R\d{3}$/.test(id)) reasons.push('Missing or invalid result ID.');
    if (!date || date > '2026-11-04') reasons.push('Missing, invalid, or future evaluation date.');
    if (!task) reasons.push('Missing or unknown task.');
    if (confidence === null) reasons.push('Confidence is missing or outside the whole-number range 0–100.');
    if (!outcome) reasons.push('Missing or unknown outcome.');
    if (reasons.length) result.review.push({ ...record, reason: reasons.join(' ') });
    else result.clean.push({ source_row, values: [id, date, task, String(confidence), outcome] });
  });
  return result;
}

function checkRowCounts(rows, result) {
  const numbers = Object.values(result).flat().map(row => row.source_row).sort((a, b) => a - b);
  return numbers.length === rows.length && numbers.every((number, i) => number === i + 2);
}

function cleanCSV(text) {
  const [header, ...rows] = parseCSV(text.replace(/^\uFEFF/, ''));
  if (JSON.stringify(header) !== JSON.stringify(CLEAN_HEADER)) throw new Error('Choose the practice raw.csv file with its original header.');
  const result = cleanRows(rows);
  if (!checkRowCounts(rows, result)) throw new Error('Row check failed.');
  return result;
}

function exportCleanCSV(result) {
  const quote = value => /[",\r\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
  return [CLEAN_HEADER, ...result.clean.map(row => row.values)]
    .map(row => row.map(quote).join(',')).join('\n') + '\n';
}
