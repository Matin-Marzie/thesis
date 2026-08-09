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
  async createWithDialogue({ createdBy, url, title, description, languageId, duration, lines }) {
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
        `INSERT INTO reels (language_id, dialogue_id, created_by, url, title, description, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, language_id, dialogue_id, created_by, url, thumbnail_url, title, description, duration, created_at`,
        [languageId, dialogueId, createdBy, url, title || null, description || null, duration]
      );

      await client.query('COMMIT');
      return reelResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

export default reelModel;
