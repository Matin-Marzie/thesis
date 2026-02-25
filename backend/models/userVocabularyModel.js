import pool from '../config/db.js';

const userVocabularyModel = {

    // Add vocabulary words for user and return only current language words
    async add(userId, userVocabulary, currentUserLanguagesId) {
        const values = [];
        const placeholders = userVocabulary.map(([wordId, data], i) => {
            const base = i * 6;
            values.push(
                userId,
                Number(wordId),
                currentUserLanguagesId,
                data.mastery_level,
                data.last_review,
                data.created_at
            );
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
        }).join(',');
        // Add filter param
        values.push(currentUserLanguagesId);
        const query = `
            WITH inserted AS (
            INSERT INTO user_vocabulary
                (user_id, word_id, user_languages_id, mastery_level, last_review, created_at)
            VALUES ${placeholders}
            RETURNING *
            )
            SELECT 
                word_id,
                user_languages_id,
                mastery_level,
                last_review,
                created_at
            FROM inserted
            WHERE user_languages_id = $${values.length};
        `;
        const result = await pool.query(query, values);
        // reshape → { wordId: { user_languages_id, mastery_level, last_review, created_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                user_languages_id: row.user_languages_id,
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
            };
            return acc;
        }, {});
    },




    // fetch user vocabulary of current language
    async get(userId, userLanguagesId) {
        const query = `
        SELECT
            word_id,
            user_languages_id,
            mastery_level,
            last_review,
            created_at
        FROM user_vocabulary
        WHERE user_id = $1 AND user_languages_id = $2
    `;

        const result = await pool.query(query, [userId, userLanguagesId]);
        // reshape → { wordId: { user_languages_id, mastery_level, last_review, created_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                user_languages_id: row.user_languages_id,
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
            };
            return acc;
        }, {});
    },


















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