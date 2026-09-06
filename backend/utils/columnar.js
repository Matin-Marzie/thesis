// Converts an array of same-shaped row objects into columnar JSON
// ({ columns, rows }), so repeated keys aren't sent once per row - shrinks
// large uniform payloads like the dictionary word list substantially.
export function toColumnar(rows, columns) {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]) : []);
  return {
    columns: cols,
    rows: rows.map((row) => cols.map((col) => row[col])),
  };
}

// Same idea, for a { id: { field: value, ... } } keyed object (e.g.
// user_vocabulary, keyed by word_id) - folds the id in as the first column.
export function toColumnarFromKeyedObject(obj, idColumnName, fieldColumns) {
  return {
    columns: [idColumnName, ...fieldColumns],
    rows: Object.entries(obj).map(([id, fields]) => [
      id,
      ...fieldColumns.map((col) => fields[col]),
    ]),
  };
}
