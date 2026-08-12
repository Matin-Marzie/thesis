import pool from '../config/db.js';
import dialogueModel from './dialogueModel.js';
import sentenceModel from './sentenceModel.js';

const reelModel = {
  // Single all-or-nothing transaction: dialogue + N sentences (subtitle
  // language, reused when identical text already exists) + N
  // dialogue_sentences (the ms-precise timing rows) + optional translation
  // sentences/links + the reels row itself.
  //
  // `lines` order in the array is authoritative for position (1-based) -
  // any client-supplied `position` field is ignored here so the
  // dialogue_sentences(dialogue_id, position) unique constraint can never be
  // violated by out-of-order/duplicate client input.
  async createWithDialogue({ createdBy, url, thumbnailUrl, title, description, languageId, duration, lines }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const dialogueId = await dialogueModel.create(client, { languageId });

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const sentenceId = await sentenceModel.findOrCreate(client, {
          languageId,
          text: line.text,
        });

        await dialogueModel.addSentence(client, {
          dialogueId,
          sentenceId,
          position: i + 1,
          startTimeMs: line.start_time_ms,
          endTimeMs: line.end_time_ms,
        });

        if (line.translation && line.translation_language_id) {
          const translationSentenceId = await sentenceModel.findOrCreate(client, {
            languageId: line.translation_language_id,
            text: line.translation,
          });
          await sentenceModel.linkTranslation(client, {
            sentenceId,
            translationSentenceId,
          });
        }
      }

      const reelResult = await client.query(
        `INSERT INTO reels (language_id, dialogue_id, created_by, url, thumbnail_url, title, description, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, language_id, dialogue_id, created_by, url, thumbnail_url, title, description, duration, created_at`,
        [languageId, dialogueId, createdBy, url, thumbnailUrl || null, title || null, description || null, duration]
      );

      await client.query('COMMIT');
      const row = reelResult.rows[0];
      return {
        ...row,
        // id/dialogue_id/created_by are bigint columns - pg returns those as
        // strings by default. reels-service (Python/Pydantic) returns plain
        // number ids, and ReelsContext's dedup logic (prependReel's filter,
        // fetchReels' append-dedup) compares ids with strict equality, so a
        // string id here silently fails to match its number counterpart
        // once the feed picks this reel up too - producing a duplicate
        // FlatList entry/key. Normalize to numbers to match that contract.
        id: Number(row.id),
        dialogue_id: Number(row.dialogue_id),
        created_by: Number(row.created_by),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Latest reels created by a user, newest first - used to show a preview
  // of "my reels" right after login without a separate round trip.
  async getLatestByUser(userId, limit = 6) {
    const result = await pool.query(
      `SELECT id, url, thumbnail_url, title, duration, created_at
       FROM reels
       WHERE created_by = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    // Same bigint-as-string normalization as createWithDialogue.
    return result.rows.map((row) => ({ ...row, id: Number(row.id) }));
  },

  // Scoped to created_by so a user can only ever delete their own reel - a
  // non-owner (or nonexistent id) simply gets no row back, no separate
  // ownership check needed. The reel's dialogue/dialogue_sentences are
  // removed by the trigger_delete_dialogue_after_reel_delete DB trigger;
  // this only returns the file URLs so the caller can clean up disk storage.
  async delete(reelId, userId) {
    const result = await pool.query(
      `DELETE FROM reels WHERE id = $1 AND created_by = $2
       RETURNING id, url, thumbnail_url`,
      [reelId, userId]
    );
    return result.rows[0] || null;
  },

  // Upserts onto the single (reel_id, user_id) row in reel_reports - a user
  // can only ever have one open report per reel, so re-reporting just
  // replaces the reason/timestamp rather than creating a duplicate row.
  // Throws with the raw pg error (caller checks .code === '23503') if
  // reelId doesn't exist, since there's no cheap existence check that
  // isn't itself a race with the FK.
  async report(reelId, userId, reason) {
    await pool.query(
      `INSERT INTO reel_reports (reel_id, user_id, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (reel_id, user_id)
       DO UPDATE SET reason = $3, created_at = now()`,
      [reelId, userId, reason]
    );
  },
};

export default reelModel;
