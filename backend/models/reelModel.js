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
  async createWithDialogue({ createdBy, url, thumbnailUrl, title, languageId, duration, lines }) {
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

        for (const translation of line.translations) {
          const translationSentenceId = await sentenceModel.findOrCreate(client, {
            languageId: translation.translation_language_id,
            text: translation.text,
          });
          await sentenceModel.linkTranslation(client, {
            sentenceId,
            translationSentenceId,
          });
        }
      }

      const reelResult = await client.query(
        `INSERT INTO reels (language_id, dialogue_id, created_by, url, thumbnail_url, title, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at`,
        [languageId, dialogueId, createdBy, url, thumbnailUrl || null, title || null, duration]
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
      `SELECT id, url, thumbnail_url, title, duration, language_id, created_at
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

  // Toggles the current user's like on a reel via a single upsert - first tap
  // inserts a liked row onto reel_interactions, a second tap flips is_liked
  // on the existing (reel_id, user_id) row instead of creating a duplicate
  // (enforced by reel_interactions' unique constraint). Race-safe: concurrent
  // toggles from the same user serialize on the row and each sees the other's
  // flip, so the returned is_liked always matches what actually persisted.
  // Throws the raw pg error (caller checks .code === '23503') if reelId
  // doesn't exist.
  async toggleLike(reelId, userId) {
    const toggleResult = await pool.query(
      `INSERT INTO reel_interactions (reel_id, user_id, is_liked)
       VALUES ($1, $2, true)
       ON CONFLICT (reel_id, user_id)
       DO UPDATE SET is_liked = NOT reel_interactions.is_liked
       RETURNING is_liked`,
      [reelId, userId]
    );
    const isLiked = toggleResult.rows[0].is_liked;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM reel_interactions WHERE reel_id = $1 AND is_liked = true`,
      [reelId]
    );

    return { isLiked, likesCount: countResult.rows[0].count };
  },

  // Toggles the current user's save (bookmark) on a reel. Same single-upsert
  // shape as toggleLike, on the same (reel_id, user_id) row - only the
  // is_saved column is touched, so an existing like on that row is untouched.
  // Throws the raw pg error (caller checks .code === '23503') if reelId
  // doesn't exist.
  async toggleSave(reelId, userId) {
    const toggleResult = await pool.query(
      `INSERT INTO reel_interactions (reel_id, user_id, is_saved)
       VALUES ($1, $2, true)
       ON CONFLICT (reel_id, user_id)
       DO UPDATE SET is_saved = NOT reel_interactions.is_saved
       RETURNING is_saved`,
      [reelId, userId]
    );

    return { isSaved: toggleResult.rows[0].is_saved };
  },

  // A user's own published reels, for viewing their public profile grid +
  // reel viewer. Shaped to satisfy both consumers in one response: flat
  // language_id (ProfileReels' grid) and nested stats/user_interaction
  // (ReelItem's full pager, once created_by is merged in client-side).
  // viewerId is null for guests - `vi.user_id = NULL` never matches in SQL,
  // so the join naturally yields "no interaction" without special-casing.
  async getReelsByUser(userId, viewerId, limit = 30) {
    const result = await pool.query(
      `SELECT
         r.id, r.url, r.thumbnail_url, r.title, r.duration, r.created_at, r.language_id,
         (SELECT COUNT(*)::int FROM reel_interactions ri WHERE ri.reel_id = r.id AND ri.is_liked) AS likes_count,
         (SELECT COUNT(*)::int FROM reel_interactions ri WHERE ri.reel_id = r.id AND ri.is_saved) AS saves_count,
         vi.is_liked AS viewer_is_liked,
         vi.is_saved AS viewer_is_saved
       FROM reels r
       LEFT JOIN reel_interactions vi ON vi.reel_id = r.id AND vi.user_id = $2
       WHERE r.created_by = $1
       ORDER BY r.created_at DESC
       LIMIT $3`,
      [userId, viewerId, limit]
    );

    return result.rows.map((row) => ({
      id: Number(row.id),
      url: row.url,
      thumbnail_url: row.thumbnail_url,
      title: row.title,
      duration: row.duration,
      created_at: row.created_at,
      language_id: row.language_id,
      stats: { likes: row.likes_count, comments: 0, saves: row.saves_count },
      user_interaction: {
        is_liked: row.viewer_is_liked ?? false,
        is_saved: row.viewer_is_saved ?? false,
      },
    }));
  },
};

export default reelModel;
