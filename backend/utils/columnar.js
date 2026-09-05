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
