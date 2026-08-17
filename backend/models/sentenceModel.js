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

  // Two different lines can end up resolving to the identical
  // (sentence_id, translation_sentence_id) pair - e.g. two lines with the
  // same text ("OK") each translated the same way reuse the same sentence
  // rows via findOrCreate - so the link may already exist; that's a no-op,
  // not an error.
  async linkTranslation(client, { sentenceId, translationSentenceId }) {
    await client.query(
      `INSERT INTO sentence_translations (sentence_id, translation_sentence_id)
       VALUES ($1, $2)
       ON CONFLICT (sentence_id, translation_sentence_id) DO NOTHING`,
      [sentenceId, translationSentenceId]
    );
  },
};

export default sentenceModel;
