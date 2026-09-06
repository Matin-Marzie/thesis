// The API sends user_vocabulary as columnar JSON ({ columns, rows }, word_id
// folded in as the first column) to avoid repeating the same keys across
// potentially thousands of entries. Expand it back into the
// { wordId: { mastery_level, ... } } shape the vocabulary reducer/state expects.
export function expandUserVocabulary(vocabulary) {
  if (!vocabulary) return vocabulary;
  const { columns, rows } = vocabulary;
  if (!Array.isArray(columns) || !Array.isArray(rows)) return vocabulary;

  const fieldColumns = columns.slice(1);
  const result = {};
  for (const row of rows) {
    const fields = {};
    for (let i = 0; i < fieldColumns.length; i++) fields[fieldColumns[i]] = row[i + 1];
    result[row[0]] = fields;
  }
  return result;
}
