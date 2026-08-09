// All methods take an active pg client (not the pool) so they can
// participate in the caller's transaction (see reelModel.createWithDialogue).
const sentenceModel = {
  // Reuse an identical (language_id, text) row if one exists; otherwise insert.
  async findOrCreate(client, { languageId, text }) {
    const existing = await client.query(
      `SELECT id FROM sentences WHERE language_id = $1 AND text = $2 LIMIT 1`,
      [languageId, text]
    );
    if (existing.rows[0]) {
      return existing.rows[0].id;
    }

    const inserted = await client.query(
      `INSERT INTO sentences (language_id, text) VALUES ($1, $2) RETURNING id`,
      [languageId, text]
    );
    return inserted.rows[0].id;
  },

  async linkTranslation(client, { sentenceId, translationSentenceId }) {
    await client.query(
      `INSERT INTO sentence_translations (sentence_id, translation_sentence_id) VALUES ($1, $2)`,
      [sentenceId, translationSentenceId]
    );
  },
};

export default sentenceModel;
