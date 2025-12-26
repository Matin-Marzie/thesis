import pool from '../config/db.js';

const userVocabularyModel = {

    // Add vocabulary words for user
    async addVocabulary(words) {
        if (!words || words.length === 0) return [];

        const values = [];
        const placeholders = words.map((w, i) => {
            const base = i * 5; // 5 columns per row
            values.push(
                w.user_id,
                w.word_id,
                w.mastery_level,
                w.last_review,
                w.created_at
            );
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
        }).join(',');

        const query = `
    INSERT INTO user_vocabulary
    (user_id, word_id, mastery_level, last_review, created_at)
    VALUES ${placeholders}
    RETURNING *;
  `;

        const result = await pool.query(query, values);
        return result.rows;
    },


    
    // fetch learned_vocabulary of current language
    async getLearnedVocabulary(userId, learning_language_id, native_language_id) {
        const query = `
        SELECT
            w.id,
            w.level,
            w.article,
            w.written_form,
            ARRAY_AGG(tw.written_form)
                FILTER (WHERE tw.id IS NOT NULL) AS translations,
            w.part_of_speech,
            w.language_id,
            w.image_url,
            w.audio_url,

            uv.mastery_level,
            uv.last_review,
            
            ARRAY_AGG(t.level)
                FILTER (WHERE tw.id IS NOT NULL) AS translation_levels

        FROM user_vocabulary uv
        JOIN words w
            ON w.id = uv.word_id

        LEFT JOIN translations t
            ON t.word_id = w.id

        LEFT JOIN words tw
            ON tw.id = t.translation_word_id
        AND tw.language_id = $3   -- native_language_id

        WHERE uv.user_id = $1
        AND w.language_id = $2     -- learning_language_id

        GROUP BY
            w.id, uv.mastery_level, uv.last_review

        ORDER BY uv.last_review DESC
    `;

        const result = await pool.query(query, [userId, learning_language_id, native_language_id]);
        return result.rows;
    },
















    

    // get user vocabulary


    // delete vocabulary words
    async deleteVocabulary(userId, [wordIds]) {
        const query = `
        DELETE FROM user_vocabulary
        WHERE user_id = $1 AND word_id = ANY($2)
        RETURNING *
        `;

        const result = await pool.query(query, [userId, wordIds]);
        return result.rows;
    },
};

export default userVocabularyModel;