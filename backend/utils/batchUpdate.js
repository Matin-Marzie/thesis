import pool from '../config/db.js';

// Rows per UPDATE statement. PostgreSQL allows at most 65,535 bind parameters
// per statement and each row costs (2 + fields.length) of them, so 500 rows
// stays far below the cap for any table used here (~5,000 params for
// user_vocabulary) while still collapsing hundreds of round trips into one.
export const UPDATE_CHUNK_SIZE = 500;

/**
 * Applies a keyed batch of partial updates to a user's rows with one
 * set-based `UPDATE ... FROM (VALUES ...)` per chunk, all inside a single
 * transaction (a failure part-way rolls the whole batch back).
 *
 * Only rows that already exist are touched - this is a plain UPDATE, never an
 * upsert, so an id deleted in the meantime is silently skipped rather than
 * recreated.
 *
 * Partial updates: rows in one batch may send different subsets of fields, and
 * a field the client did not send must keep its stored value. Each row carries
 * a `set_mask` bit per field ("was this field sent?") and the SET clause is
 * `CASE WHEN bit THEN sent value ELSE stored value END`. A per-row flag is
 * used instead of COALESCE(sent, stored) so that an explicitly sent `null`
 * still writes NULL (stability/difficulty/last_review can legitimately be
 * cleared) while an omitted field is left alone. `undefined` is the only
 * "not sent" signal - 0, false and null are all real values. For NOT NULL
 * columns a sent null still fails the constraint exactly as the old per-row
 * UPDATE did, except the whole batch now rolls back.
 *
 * @param {Object} opts
 * @param {string} opts.table - Table to update (trusted constant, interpolated)
 * @param {string} opts.keyColumn - Per-row id column (e.g. 'word_id'), matched against the updates' keys
 * @param {Array<{name: string, type: string}>} opts.fields - Updatable columns and their SQL types (for the VALUES casts)
 * @param {string[]} opts.returning - Columns to return from each updated row
 * @param {number} opts.userId - Owner; rows of other users are never touched
 * @param {number} opts.userLanguagesId - Only rows of this user_languages entry are updated
 * @param {Object} opts.updates - { id: { field: value, ... } }
 * @returns {Promise<Object[]>} The updated rows (one per existing id), restricted to `returning`
 */
export async function batchUpdateByKey({ table, keyColumn, fields, returning, userId, userLanguagesId, updates }) {
    // Collapse to one entry per numeric id with a mask of the fields sent. Keys
    // like "1" and "01" both map to id 1; merging them (later wins per field)
    // matches the old sequential behaviour, whereas a duplicate id in VALUES
    // would leave "which row wins" undefined.
    const merged = new Map();
    for (const [rawId, data] of Object.entries(updates)) {
        const id = Number(rawId);
        for (let i = 0; i < fields.length; i++) {
            const value = data[fields[i].name];
            if (value === undefined) continue;
            if (!merged.has(id)) merged.set(id, { mask: 0, data: {} });
            const entry = merged.get(id);
            entry.mask |= 1 << i;
            entry.data[fields[i].name] = value;
        }
    }

    // Nothing to write - skip the connection and the transaction entirely.
    if (merged.size === 0) return [];

    const entries = [...merged.entries()];
    const columnList = [keyColumn, 'set_mask', ...fields.map((f) => f.name)].join(', ');
    const setClause = fields
        .map((f, i) => `${f.name} = CASE WHEN (v.set_mask & ${1 << i}) <> 0 THEN v.${f.name} ELSE t.${f.name} END`)
        .join(', ');
    const returningList = returning.map((col) => `t.${col}`).join(', ');
    const paramsPerRow = 2 + fields.length;

    const rows = [];
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (let start = 0; start < entries.length; start += UPDATE_CHUNK_SIZE) {
            const chunk = entries.slice(start, start + UPDATE_CHUNK_SIZE);
            const values = [userId, userLanguagesId];
            const placeholders = chunk.map(([id, { mask, data }], i) => {
                const base = 2 + i * paramsPerRow;
                values.push(id, mask, ...fields.map((f) => data[f.name] ?? null));
                // Explicit casts: an untyped VALUES column is inferred from its
                // first row and fails on NULLs or on later rows of another shape.
                const casts = [`$${base + 1}::bigint`, `$${base + 2}::int`, ...fields.map((f, j) => `$${base + 3 + j}::${f.type}`)];
                return `(${casts.join(', ')})`;
            }).join(', ');

            const result = await client.query(
                `UPDATE ${table} AS t
                 SET ${setClause}
                 FROM (VALUES ${placeholders}) AS v(${columnList})
                 WHERE t.user_id = $1 AND t.user_languages_id = $2 AND t.${keyColumn} = v.${keyColumn}
                 RETURNING ${returningList}`,
                values
            );
            rows.push(...result.rows);
        }

        await client.query('COMMIT');
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch {
            // The connection is unusable; the original error is the useful one.
        }
        throw err;
    } finally {
        client.release();
    }

    return rows;
}
