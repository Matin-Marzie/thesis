import { jest } from '@jest/globals';
import pool from '../config/db.js';
import { closeTestPool } from './helpers/testUser.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';
import { UPDATE_CHUNK_SIZE } from '../utils/batchUpdate.js';
import {
  VOCAB_BASELINE,
  SENTENCE_BASELINE,
  createSyncFixture,
  deleteSyncFixture,
  seedVocabulary,
  seedSentences,
  readVocabulary,
  readSentences,
} from './helpers/syncFixtures.js';

// More rows than one chunk, so multi-chunk behaviour is exercised for real.
const BIG = UPDATE_CHUNK_SIZE * 2 + 100;

const VOCAB_FIELDS = ['last_review', 'created_at', 'review_count', 'next_review_at', 'stability', 'difficulty', 'lapses', 'fsrs_state', 'learning_steps'];
const SENTENCE_FIELDS = ['mastery_level', 'last_review', 'created_at', 'review_count', 'next_review_at'];

// Records every statement sent over dedicated (pool.connect) clients, so a test
// can assert how many round trips an update() made.
const recordStatements = () => {
  const statements = [];
  const patched = [];
  const realConnect = pool.connect.bind(pool);
  const spy = jest.spyOn(pool, 'connect').mockImplementation(async () => {
    const client = await realConnect();
    const realQuery = client.query.bind(client);
    client.query = (...args) => {
      statements.push(typeof args[0] === 'string' ? args[0] : args[0].text);
      return realQuery(...args);
    };
    patched.push([client, realQuery]);
    return client;
  });
  return {
    statements,
    stop: () => {
      patched.forEach(([client, realQuery]) => { client.query = realQuery; });
      spy.mockRestore();
    },
  };
};

// Reference implementation: the original per-row loop, kept here as an oracle
// so the set-based version can be checked against the behaviour it replaced.
const oracleUpdate = async (table, keyColumn, allowedFields, returning, userId, userLanguagesId, updates) => {
  const results = {};
  for (const [id, data] of Object.entries(updates)) {
    const sets = [];
    const values = [userId, Number(id), userLanguagesId];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        values.push(data[field]);
        sets.push(`${field} = $${values.length}`);
      }
    }
    if (sets.length === 0) continue;
    const result = await pool.query(
      `UPDATE ${table} SET ${sets.join(', ')}
       WHERE user_id = $1 AND ${keyColumn} = $2 AND user_languages_id = $3
       RETURNING ${returning.join(', ')}`,
      values
    );
    if (result.rows[0]) results[id] = result.rows[0];
  }
  return results;
};

// Runs after each describe's own afterAll (fixture cleanup still needs the pool).
afterAll(async () => {
  await closeTestPool();
});

describe('userVocabularyModel.update (batched)', () => {
  let f;

  beforeAll(async () => {
    f = await createSyncFixture('vocab_update', { words: BIG });
  });

  afterAll(async () => {
    await deleteSyncFixture(f);
  });

  // Fresh baseline rows before every test.
  beforeEach(async () => {
    await pool.query('DELETE FROM user_vocabulary WHERE user_id = $1', [f.user.id]);
    await seedVocabulary(f.user.id, f.userLanguagesId, f.wordIds);
  });

  test('updates many rows in one call and returns them keyed by word id with the usual fields', async () => {
    const targets = f.wordIds.slice(0, 50);
    const updates = Object.fromEntries(targets.map((id, i) => [id, { review_count: 100 + i, stability: 10 + i }]));

    const result = await userVocabularyModel.update(f.user.id, f.userLanguagesId, updates);

    expect(Object.keys(result).map(Number).sort((a, b) => a - b)).toEqual(targets);
    expect(Object.keys(result[targets[0]]).sort()).toEqual([...VOCAB_FIELDS].sort());
    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    targets.forEach((id, i) => {
      expect(stored[id].review_count).toBe(100 + i);
      expect(stored[id].stability).toBe(10 + i);
      expect(result[id].review_count).toBe(100 + i);
    });
    // Rows not in the batch are untouched.
    expect(stored[f.wordIds[60]].review_count).toBe(VOCAB_BASELINE.review_count);
  });

  test('partial field sets: unsent fields keep their stored value', async () => {
    const [a, b, c] = f.wordIds;
    const newReview = '2025-06-01T12:00:00.000Z';
    await userVocabularyModel.update(f.user.id, f.userLanguagesId, {
      [a]: { stability: 42 }, // only one field
      [b]: { // everything updatable
        last_review: newReview, review_count: 9, next_review_at: '2025-06-08T12:00:00.000Z',
        stability: 8.25, difficulty: 4.5, lapses: 7, fsrs_state: 3, learning_steps: 4,
      },
      [c]: { difficulty: 1.5, lapses: 6 }, // a different subset
    });

    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(stored[a]).toEqual({ ...VOCAB_BASELINE, stability: 42 });
    expect(stored[b]).toEqual({
      created_at: VOCAB_BASELINE.created_at, // never updatable
      last_review: newReview, review_count: 9, next_review_at: '2025-06-08T12:00:00.000Z',
      stability: 8.25, difficulty: 4.5, lapses: 7, fsrs_state: 3, learning_steps: 4,
    });
    expect(stored[c]).toEqual({ ...VOCAB_BASELINE, difficulty: 1.5, lapses: 6 });
  });

  test('a sent 0 is written, not treated as "unchanged"', async () => {
    const [id] = f.wordIds;
    await userVocabularyModel.update(f.user.id, f.userLanguagesId, {
      [id]: { review_count: 0, stability: 0, difficulty: 0, lapses: 0, fsrs_state: 0, learning_steps: 0 },
    });

    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(stored[id]).toMatchObject({ review_count: 0, stability: 0, difficulty: 0, lapses: 0, fsrs_state: 0, learning_steps: 0 });
    // ...and the fields that were not sent still hold their baseline.
    expect(stored[id].last_review).toBe(VOCAB_BASELINE.last_review);
    expect(stored[id].next_review_at).toBe(VOCAB_BASELINE.next_review_at);
  });

  test('an explicit null clears the nullable columns; an omitted field does not', async () => {
    const [cleared, untouched] = f.wordIds;
    await userVocabularyModel.update(f.user.id, f.userLanguagesId, {
      [cleared]: { stability: null, difficulty: null, last_review: null },
      [untouched]: { review_count: 6 },
    });

    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(stored[cleared]).toMatchObject({ stability: null, difficulty: null, last_review: null, review_count: VOCAB_BASELINE.review_count });
    expect(stored[untouched].stability).toBe(VOCAB_BASELINE.stability);
    expect(stored[untouched].last_review).toBe(VOCAB_BASELINE.last_review);
  });

  test('a word id with no row is skipped (no error, not recreated); the rest still update', async () => {
    const [id] = f.wordIds;
    const missing = f.wordIds[f.wordIds.length - 1] + 1000;
    await pool.query('DELETE FROM user_vocabulary WHERE user_id = $1 AND word_id = $2', [f.user.id, f.wordIds[1]]);

    const result = await userVocabularyModel.update(f.user.id, f.userLanguagesId, {
      [id]: { review_count: 77 },
      [f.wordIds[1]]: { review_count: 78 }, // deleted in the meantime
      [missing]: { review_count: 79 }, // never existed
    });

    expect(Object.keys(result)).toEqual([String(id)]);
    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(stored[id].review_count).toBe(77);
    expect(stored[f.wordIds[1]]).toBeUndefined();
    expect(stored[missing]).toBeUndefined();
  });

  test("only touches the given user_languages_id's rows", async () => {
    const [id] = f.wordIds;
    const result = await userVocabularyModel.update(f.user.id, f.userLanguagesId + 12345, { [id]: { review_count: 1 } });
    expect(result).toEqual({});
    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(stored[id].review_count).toBe(VOCAB_BASELINE.review_count);
  });

  test('returns {} without touching the database when no row has any field', async () => {
    const recorder = recordStatements();
    try {
      expect(await userVocabularyModel.update(f.user.id, f.userLanguagesId, {})).toEqual({});
      expect(await userVocabularyModel.update(f.user.id, f.userLanguagesId, { [f.wordIds[0]]: {} })).toEqual({});
      expect(await userVocabularyModel.update(f.user.id, f.userLanguagesId, { [f.wordIds[0]]: { stability: undefined } })).toEqual({});
      expect(recorder.statements).toEqual([]);
    } finally {
      recorder.stop();
    }
  });

  test('duplicate ids ("1" and "01") merge with the later entry winning per field', async () => {
    const [id] = f.wordIds;
    await userVocabularyModel.update(f.user.id, f.userLanguagesId, {
      [String(id)]: { review_count: 10, lapses: 3 },
      [`0${id}`]: { review_count: 11 },
    });
    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(stored[id]).toMatchObject({ review_count: 11, lapses: 3 });
  });

  test('a batch larger than one chunk is applied in a few statements, not one per row', async () => {
    const updates = Object.fromEntries(f.wordIds.map((id) => [id, { review_count: id % 1000, lapses: 1 }]));
    const recorder = recordStatements();
    let result;
    try {
      result = await userVocabularyModel.update(f.user.id, f.userLanguagesId, updates);
    } finally {
      recorder.stop();
    }

    const chunks = Math.ceil(BIG / UPDATE_CHUNK_SIZE);
    expect(chunks).toBeGreaterThan(1);
    expect(recorder.statements).toHaveLength(chunks + 2); // BEGIN + one UPDATE per chunk + COMMIT
    expect(recorder.statements[0]).toBe('BEGIN');
    expect(recorder.statements.at(-1)).toBe('COMMIT');

    expect(Object.keys(result)).toHaveLength(BIG);
    const stored = await readVocabulary(f.user.id, f.userLanguagesId);
    for (const id of f.wordIds) {
      expect(stored[id]).toMatchObject({ review_count: id % 1000, lapses: 1 });
    }
  });

  test('a failure in a later chunk rolls back the earlier chunks too', async () => {
    const before = await readVocabulary(f.user.id, f.userLanguagesId);
    const updates = Object.fromEntries(f.wordIds.map((id) => [id, { review_count: 999 }]));
    // NOT NULL column: fails on a row in the last chunk, after the first
    // chunks' UPDATEs have already run inside the transaction.
    updates[f.wordIds[BIG - 1]] = { review_count: null };

    await expect(userVocabularyModel.update(f.user.id, f.userLanguagesId, updates)).rejects.toThrow(/null value|not-null/i);

    expect(await readVocabulary(f.user.id, f.userLanguagesId)).toEqual(before);
  });

  test('the connection is released after a failure (pool is not leaked)', async () => {
    const [id] = f.wordIds;
    for (let i = 0; i < 15; i++) { // more attempts than pool.max (10)
      await expect(userVocabularyModel.update(f.user.id, f.userLanguagesId, { [id]: { review_count: null } })).rejects.toThrow();
    }
    // Still usable, and nothing is left checked out.
    await expect(userVocabularyModel.update(f.user.id, f.userLanguagesId, { [id]: { review_count: 1 } })).resolves.toBeDefined();
    expect(pool.totalCount - pool.idleCount).toBe(0);
  });

  test('matches the original per-row loop on a randomised mixed payload', async () => {
    // Deterministic LCG so a failure is reproducible.
    let seed = 12345;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

    const generators = {
      last_review: () => (rnd() < 0.2 ? null : new Date(1750000000000 + Math.floor(rnd() * 1e9)).toISOString()),
      review_count: () => Math.floor(rnd() * 4), // includes 0
      next_review_at: () => new Date(1760000000000 + Math.floor(rnd() * 1e9)).toISOString(),
      stability: () => (rnd() < 0.2 ? null : Math.floor(rnd() * 3) * 1.25), // includes 0 and null
      difficulty: () => (rnd() < 0.2 ? null : Math.floor(rnd() * 3) * 2.5),
      lapses: () => Math.floor(rnd() * 3),
      fsrs_state: () => Math.floor(rnd() * 4),
      learning_steps: () => Math.floor(rnd() * 3),
    };
    const updates = {};
    for (const id of f.wordIds.slice(0, 200)) {
      const data = {};
      for (const [field, gen] of Object.entries(generators)) {
        if (rnd() < 0.4) data[field] = gen();
      }
      updates[id] = data; // some end up empty
    }
    const returning = ['word_id', 'user_languages_id', ...VOCAB_FIELDS];

    // Oracle first, on the baseline rows; then reset and run the new code.
    const expected = await oracleUpdate('user_vocabulary', 'word_id', Object.keys(generators), returning, f.user.id, f.userLanguagesId, updates);
    const expectedTable = await readVocabulary(f.user.id, f.userLanguagesId);
    await pool.query('DELETE FROM user_vocabulary WHERE user_id = $1', [f.user.id]);
    await seedVocabulary(f.user.id, f.userLanguagesId, f.wordIds);

    const actual = await userVocabularyModel.update(f.user.id, f.userLanguagesId, updates);
    const actualTable = await readVocabulary(f.user.id, f.userLanguagesId);

    expect(actualTable).toEqual(expectedTable);
    expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
    for (const [id, row] of Object.entries(expected)) {
      expect(actual[id]).toEqual(Object.fromEntries(VOCAB_FIELDS.map((k) => [k, row[k]])));
    }
  });
});

describe('userSentencesModel.update (batched)', () => {
  let f;

  beforeAll(async () => {
    f = await createSyncFixture('sentence_update', { sentences: BIG });
  });

  afterAll(async () => {
    await deleteSyncFixture(f);
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM user_sentences WHERE user_id = $1', [f.user.id]);
    await seedSentences(f.user.id, f.userLanguagesId, f.sentenceIds);
  });

  test('updates many rows in one call and returns them keyed by sentence id with the usual fields', async () => {
    const targets = f.sentenceIds.slice(0, 50);
    const updates = Object.fromEntries(targets.map((id, i) => [id, { mastery_level: (i % 6) + 1, review_count: 20 + i }]));

    const result = await userSentencesModel.update(f.user.id, f.userLanguagesId, updates);

    expect(Object.keys(result).map(Number).sort((a, b) => a - b)).toEqual(targets);
    expect(Object.keys(result[targets[0]]).sort()).toEqual([...SENTENCE_FIELDS].sort());
    const stored = await readSentences(f.user.id, f.userLanguagesId);
    targets.forEach((id, i) => {
      expect(stored[id].mastery_level).toBe((i % 6) + 1);
      expect(stored[id].review_count).toBe(20 + i);
    });
    expect(stored[f.sentenceIds[60]].mastery_level).toBe(SENTENCE_BASELINE.mastery_level);
  });

  test('partial field sets: unsent fields keep their stored value', async () => {
    const [a, b] = f.sentenceIds;
    await userSentencesModel.update(f.user.id, f.userLanguagesId, {
      [a]: { mastery_level: 6 },
      [b]: { mastery_level: 1, last_review: '2025-07-01T00:00:00.000Z', review_count: 8, next_review_at: '2025-07-05T00:00:00.000Z' },
    });

    const stored = await readSentences(f.user.id, f.userLanguagesId);
    expect(stored[a]).toEqual({ ...SENTENCE_BASELINE, mastery_level: 6 });
    expect(stored[b]).toEqual({
      created_at: SENTENCE_BASELINE.created_at,
      mastery_level: 1, last_review: '2025-07-01T00:00:00.000Z', review_count: 8, next_review_at: '2025-07-05T00:00:00.000Z',
    });
  });

  test('a sent 0 is written, not treated as "unchanged"', async () => {
    const [id] = f.sentenceIds;
    await userSentencesModel.update(f.user.id, f.userLanguagesId, { [id]: { review_count: 0 } });
    const stored = await readSentences(f.user.id, f.userLanguagesId);
    expect(stored[id].review_count).toBe(0);
    expect(stored[id].mastery_level).toBe(SENTENCE_BASELINE.mastery_level);
  });

  test('a sentence id with no row is skipped; the rest still update', async () => {
    const [id] = f.sentenceIds;
    const missing = f.sentenceIds[f.sentenceIds.length - 1] + 1000;
    const result = await userSentencesModel.update(f.user.id, f.userLanguagesId, {
      [id]: { mastery_level: 5 },
      [missing]: { mastery_level: 5 },
    });
    expect(Object.keys(result)).toEqual([String(id)]);
    expect((await readSentences(f.user.id, f.userLanguagesId))[missing]).toBeUndefined();
  });

  test('returns {} without touching the database when no row has any field', async () => {
    const recorder = recordStatements();
    try {
      expect(await userSentencesModel.update(f.user.id, f.userLanguagesId, {})).toEqual({});
      expect(await userSentencesModel.update(f.user.id, f.userLanguagesId, { [f.sentenceIds[0]]: {} })).toEqual({});
      expect(recorder.statements).toEqual([]);
    } finally {
      recorder.stop();
    }
  });

  test('a batch larger than one chunk is applied in a few statements, not one per row', async () => {
    const updates = Object.fromEntries(f.sentenceIds.map((id) => [id, { mastery_level: (id % 6) + 1, review_count: 1 }]));
    const recorder = recordStatements();
    let result;
    try {
      result = await userSentencesModel.update(f.user.id, f.userLanguagesId, updates);
    } finally {
      recorder.stop();
    }

    expect(recorder.statements).toHaveLength(Math.ceil(BIG / UPDATE_CHUNK_SIZE) + 2);
    expect(Object.keys(result)).toHaveLength(BIG);
    const stored = await readSentences(f.user.id, f.userLanguagesId);
    for (const id of f.sentenceIds) {
      expect(stored[id]).toMatchObject({ mastery_level: (id % 6) + 1, review_count: 1 });
    }
  });

  test('a failure in a later chunk rolls back the earlier chunks too', async () => {
    const before = await readSentences(f.user.id, f.userLanguagesId);
    const updates = Object.fromEntries(f.sentenceIds.map((id) => [id, { mastery_level: 6 }]));
    // mastery_level 0 passes request validation but violates the table's
    // CHECK (1..6); put it in the last chunk.
    updates[f.sentenceIds[BIG - 1]] = { mastery_level: 0 };

    await expect(userSentencesModel.update(f.user.id, f.userLanguagesId, updates)).rejects.toThrow(/check constraint/i);

    expect(await readSentences(f.user.id, f.userLanguagesId)).toEqual(before);
  });

  test('matches the original per-row loop on a randomised mixed payload', async () => {
    let seed = 987;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const generators = {
      mastery_level: () => 1 + Math.floor(rnd() * 6),
      last_review: () => new Date(1750000000000 + Math.floor(rnd() * 1e9)).toISOString(),
      review_count: () => Math.floor(rnd() * 4),
      next_review_at: () => new Date(1760000000000 + Math.floor(rnd() * 1e9)).toISOString(),
    };
    const updates = {};
    for (const id of f.sentenceIds.slice(0, 200)) {
      const data = {};
      for (const [field, gen] of Object.entries(generators)) {
        if (rnd() < 0.4) data[field] = gen();
      }
      updates[id] = data;
    }
    const returning = ['sentence_id', 'user_languages_id', ...SENTENCE_FIELDS];

    const expected = await oracleUpdate('user_sentences', 'sentence_id', Object.keys(generators), returning, f.user.id, f.userLanguagesId, updates);
    const expectedTable = await readSentences(f.user.id, f.userLanguagesId);
    await pool.query('DELETE FROM user_sentences WHERE user_id = $1', [f.user.id]);
    await seedSentences(f.user.id, f.userLanguagesId, f.sentenceIds);

    const actual = await userSentencesModel.update(f.user.id, f.userLanguagesId, updates);

    expect(await readSentences(f.user.id, f.userLanguagesId)).toEqual(expectedTable);
    expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
    for (const [id, row] of Object.entries(expected)) {
      expect(actual[id]).toEqual(Object.fromEntries(SENTENCE_FIELDS.map((k) => [k, row[k]])));
    }
  });
});
