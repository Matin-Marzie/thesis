import pool from '../../config/db.js';
import { createTestUser, deleteTestUser } from './testUser.js';

// Baseline values every seeded row starts with, so tests can tell "written"
// from "left alone" (none of these is 0 or null).
export const VOCAB_BASELINE = {
  last_review: '2025-01-01T00:00:00.000Z',
  created_at: '2025-01-01T00:00:00.000Z',
  review_count: 5,
  next_review_at: '2025-01-02T00:00:00.000Z',
  stability: 3.5,
  difficulty: 6.5,
  lapses: 2,
  fsrs_state: 2,
  learning_steps: 1,
};

export const SENTENCE_BASELINE = {
  mastery_level: 3,
  last_review: '2025-01-01T00:00:00.000Z',
  created_at: '2025-01-01T00:00:00.000Z',
  review_count: 5,
  next_review_at: '2025-01-02T00:00:00.000Z',
};

// A throwaway user with one learning language, plus `words` words and
// `sentences` sentences to attach vocabulary/saved-sentence rows to. The
// words/sentences tables are structure-only in a fresh database, so the
// fixture creates its own. Callers must deleteSyncFixture in an afterAll.
export const createSyncFixture = async (label, { words = 0, sentences = 0 } = {}) => {
  const user = await createTestUser(label);

  const code = `t${Math.floor(Math.random() * 1e8)}`;
  const { rows: [language] } = await pool.query(
    'INSERT INTO languages (name, code) VALUES ($1, $2) RETURNING id',
    [`Test ${code}`, code]
  );

  const { rows: [userLanguage] } = await pool.query(
    `INSERT INTO user_languages (user_id, native_language_id, learning_language_id)
     VALUES ($1, $2, $2) RETURNING id`,
    [user.id, language.id]
  );

  const { rows: wordRows } = await pool.query(
    `INSERT INTO words (written_form, language_id)
     SELECT 'w' || g, $1 FROM generate_series(1, $2::int) g
     RETURNING id`,
    [language.id, words]
  );
  const { rows: sentenceRows } = await pool.query(
    `INSERT INTO sentences (language_id, text)
     SELECT $1, 's' || g FROM generate_series(1, $2::int) g
     RETURNING id`,
    [language.id, sentences]
  );

  return {
    user,
    languageId: Number(language.id),
    userLanguagesId: Number(userLanguage.id),
    wordIds: wordRows.map((r) => Number(r.id)).sort((a, b) => a - b),
    sentenceIds: sentenceRows.map((r) => Number(r.id)).sort((a, b) => a - b),
  };
};

export const deleteSyncFixture = async (fixture) => {
  // Deleting the user cascades user_languages/user_vocabulary/user_sentences;
  // words and sentences reference the language, so they go before it.
  await deleteTestUser(fixture.user.id);
  await pool.query('DELETE FROM words WHERE language_id = $1', [fixture.languageId]);
  await pool.query('DELETE FROM sentences WHERE language_id = $1', [fixture.languageId]);
  await pool.query('DELETE FROM languages WHERE id = $1', [fixture.languageId]);
};

// Inserts baseline user_vocabulary rows for the given word ids.
export const seedVocabulary = async (userId, userLanguagesId, wordIds, baseline = VOCAB_BASELINE) => {
  await pool.query(
    `INSERT INTO user_vocabulary
       (user_id, word_id, user_languages_id, last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps)
     SELECT $1, w, $2, $4, $5, $6, $7, $8, $9, $10, $11, $12 FROM unnest($3::bigint[]) w`,
    [userId, userLanguagesId, wordIds, baseline.last_review, baseline.created_at, baseline.review_count, baseline.next_review_at, baseline.stability, baseline.difficulty, baseline.lapses, baseline.fsrs_state, baseline.learning_steps]
  );
};

// Inserts baseline user_sentences rows for the given sentence ids.
export const seedSentences = async (userId, userLanguagesId, sentenceIds, baseline = SENTENCE_BASELINE) => {
  await pool.query(
    `INSERT INTO user_sentences
       (user_id, sentence_id, user_languages_id, mastery_level, last_review, created_at, review_count, next_review_at)
     SELECT $1, s, $2, $4, $5, $6, $7, $8 FROM unnest($3::bigint[]) s`,
    [userId, userLanguagesId, sentenceIds, baseline.mastery_level, baseline.last_review, baseline.created_at, baseline.review_count, baseline.next_review_at]
  );
};

// Current table contents keyed by id, as plain JSON-comparable values
// (timestamps as ISO strings), for whole-table before/after comparisons.
export const readVocabulary = async (userId, userLanguagesId) => {
  const { rows } = await pool.query(
    `SELECT word_id, last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps
     FROM user_vocabulary WHERE user_id = $1 AND user_languages_id = $2`,
    [userId, userLanguagesId]
  );
  return keyedByIso(rows, 'word_id');
};

export const readSentences = async (userId, userLanguagesId) => {
  const { rows } = await pool.query(
    `SELECT sentence_id, mastery_level, last_review, created_at, review_count, next_review_at
     FROM user_sentences WHERE user_id = $1 AND user_languages_id = $2`,
    [userId, userLanguagesId]
  );
  return keyedByIso(rows, 'sentence_id');
};

const keyedByIso = (rows, idColumn) =>
  Object.fromEntries(
    rows.map(({ [idColumn]: id, ...fields }) => [
      id,
      Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
      ),
    ])
  );
