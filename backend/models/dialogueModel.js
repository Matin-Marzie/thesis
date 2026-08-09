// All methods take an active pg client (not the pool) so they can
// participate in the caller's transaction (see reelModel.createWithDialogue).
const dialogueModel = {
  async create(client, { languageId }) {
    const result = await client.query(
      `INSERT INTO dialogues (language_id) VALUES ($1) RETURNING id`,
      [languageId]
    );
    return result.rows[0].id;
  },

  async addSentence(client, { dialogueId, sentenceId, position, startTimeMs, endTimeMs }) {
    await client.query(
      `INSERT INTO dialogue_sentences (dialogue_id, sentence_id, position, start_time_ms, end_time_ms)
       VALUES ($1, $2, $3, $4, $5)`,
      [dialogueId, sentenceId, position, startTimeMs, endTimeMs]
    );
  },
};

export default dialogueModel;
