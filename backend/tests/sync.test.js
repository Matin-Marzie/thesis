import request from 'supertest';
import app from '../app.js';
import pool from '../config/db.js';
import { generateAccessToken } from '../utils/tokens.js';
import { closeTestPool } from './helpers/testUser.js';
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

const VOCAB_FIELDS = ['last_review', 'created_at', 'review_count', 'next_review_at', 'stability', 'difficulty', 'lapses', 'fsrs_state', 'learning_steps'];
const SENTENCE_FIELDS = ['mastery_level', 'last_review', 'created_at', 'review_count', 'next_review_at'];

describe('POST /api/v1/user/sync', () => {
  let f;
  let auth;

  beforeAll(async () => {
    f = await createSyncFixture('sync', { words: 8, sentences: 8 });
    auth = `Bearer ${generateAccessToken(f.user)}`;
  });

  afterAll(async () => {
    await deleteSyncFixture(f);
    await closeTestPool();
  });

  beforeEach(async () => {
    // Words 0-4 and sentences 0-4 start as baseline rows; 5-7 have no row yet.
    await Promise.all([
      seedVocabularyReset(),
      seedSentencesReset(),
    ]);
  });

  const seedVocabularyReset = async () => {
    await pool.query('DELETE FROM user_vocabulary WHERE user_id = $1', [f.user.id]);
    await seedVocabulary(f.user.id, f.userLanguagesId, f.wordIds.slice(0, 5));
  };
  const seedSentencesReset = async () => {
    await pool.query('DELETE FROM user_sentences WHERE user_id = $1', [f.user.id]);
    await seedSentences(f.user.id, f.userLanguagesId, f.sentenceIds.slice(0, 5));
  };

  test('mixed delete/update/insert payload keeps the response shape and applies deletes, then updates, then inserts', async () => {
    const [w0, w1, w2, w3, w4, w5, w6] = f.wordIds;
    const [s0, s1, s2, s3, s4, s5] = f.sentenceIds;
    const created = '2025-08-01T00:00:00.000Z';

    const res = await request(app)
      .post('/api/v1/user/sync')
      .set('Authorization', auth)
      .send({
        user_progress: { current_user_languages_id: f.userLanguagesId, energy: 42 },
        vocabulary_changes: {
          deletes: { [w0]: true, [w4]: true },
          updates: {
            [w1]: { stability: 9.5 },
            [w2]: { review_count: 0, lapses: 0 },
            [w0]: { review_count: 99 }, // deleted in the same sync: must be skipped, not resurrected
          },
          inserts: {
            [w5]: { created_at: created, last_review: created },
            [w4]: { created_at: created, last_review: created, review_count: 1 }, // delete-then-recreate
          },
        },
        sentence_changes: {
          deletes: { [s0]: true },
          updates: {
            [s1]: { mastery_level: 5 },
            [s2]: { last_review: '2025-09-01T00:00:00.000Z' },
            [s0]: { mastery_level: 6 },
          },
          inserts: {
            [s5]: { mastery_level: 2, created_at: created, last_review: created },
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sync completed successfully');
    const { results } = res.body;

    expect(results.user_progress).toEqual({ energy: 42, coins: f.user.coins });

    // Vocabulary: same keys as before, updates keyed by word id with all 9 fields.
    expect(Object.keys(results.vocabulary_changes).sort()).toEqual(['deletes', 'inserts', 'updates']);
    expect(results.vocabulary_changes.deletes).toBe(2);
    expect(Object.keys(results.vocabulary_changes.updates).sort()).toEqual([String(w1), String(w2)].sort());
    expect(Object.keys(results.vocabulary_changes.updates[w1]).sort()).toEqual([...VOCAB_FIELDS].sort());
    expect(results.vocabulary_changes.updates[w1].stability).toBe(9.5);
    expect(results.vocabulary_changes.updates[w2]).toMatchObject({ review_count: 0, lapses: 0 });
    expect(Object.keys(results.vocabulary_changes.inserts).sort()).toEqual([String(w4), String(w5)].sort());

    // Sentences: likewise.
    expect(Object.keys(results.sentence_changes).sort()).toEqual(['deletes', 'inserts', 'updates']);
    expect(results.sentence_changes.deletes).toBe(1);
    expect(Object.keys(results.sentence_changes.updates).sort()).toEqual([String(s1), String(s2)].sort());
    expect(Object.keys(results.sentence_changes.updates[s1]).sort()).toEqual([...SENTENCE_FIELDS].sort());
    expect(Object.keys(results.sentence_changes.inserts)).toEqual([String(s5)]);

    // Stored state.
    const vocab = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(vocab[w0]).toBeUndefined(); // deleted, and the later update did not recreate it
    expect(vocab[w1]).toEqual({ ...VOCAB_BASELINE, stability: 9.5 });
    expect(vocab[w2]).toEqual({ ...VOCAB_BASELINE, review_count: 0, lapses: 0 });
    expect(vocab[w3]).toEqual(VOCAB_BASELINE);
    expect(vocab[w4]).toMatchObject({ review_count: 1, created_at: created }); // recreated fresh
    expect(vocab[w5]).toMatchObject({ created_at: created });
    expect(vocab[w6]).toBeUndefined();

    const sentences = await readSentences(f.user.id, f.userLanguagesId);
    expect(sentences[s0]).toBeUndefined();
    expect(sentences[s1]).toEqual({ ...SENTENCE_BASELINE, mastery_level: 5 });
    expect(sentences[s2]).toEqual({ ...SENTENCE_BASELINE, last_review: '2025-09-01T00:00:00.000Z' });
    expect(sentences[s3]).toEqual(SENTENCE_BASELINE);
    expect(sentences[s4]).toEqual(SENTENCE_BASELINE);
    expect(sentences[s5]).toMatchObject({ mastery_level: 2, created_at: created });
  });

  test('updates-only payload returns the updated rows keyed by id', async () => {
    const ids = f.wordIds.slice(0, 3);
    const res = await request(app)
      .post('/api/v1/user/sync')
      .set('Authorization', auth)
      .send({
        user_progress: { current_user_languages_id: f.userLanguagesId },
        vocabulary_changes: {
          updates: Object.fromEntries(ids.map((id, i) => [id, { review_count: i, stability: null }])),
        },
      });

    expect(res.status).toBe(200);
    expect(Object.keys(res.body.results.vocabulary_changes)).toEqual(['updates']);
    ids.forEach((id, i) => {
      expect(res.body.results.vocabulary_changes.updates[id]).toMatchObject({ review_count: i, stability: null });
    });
  });

  test('a failing update rolls the batch back and the endpoint answers 500 as before', async () => {
    const [w0, w1] = f.wordIds;
    const res = await request(app)
      .post('/api/v1/user/sync')
      .set('Authorization', auth)
      .send({
        user_progress: { current_user_languages_id: f.userLanguagesId },
        vocabulary_changes: {
          // next_review_at is NOT NULL but passes request validation (allow(null)).
          updates: { [w0]: { review_count: 50 }, [w1]: { next_review_at: null } },
        },
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error during sync');
    const vocab = await readVocabulary(f.user.id, f.userLanguagesId);
    expect(vocab[w0].review_count).toBe(VOCAB_BASELINE.review_count); // no partial batch left behind
  });
});
