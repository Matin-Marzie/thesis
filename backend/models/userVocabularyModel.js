import pool from '../config/db.js';

const userVocabularyModel = {

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
        // reshape → { wordId: { mastery_level, last_review, created_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
            };
            return acc;
        }, {});
    },

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
        // reshape → { wordId: { mastery_level, last_review, created_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
            };
            return acc;
        }, {});
    },


    // Update vocabulary words
    async update(userId, userLanguagesId, updates) {
        const results = [];
        
        for (const [wordId, data] of Object.entries(updates)) {
            const fields = [];
            const values = [userId, Number(wordId), userLanguagesId];
            let paramCount = 4;
            
            if (data.mastery_level !== undefined) {
                fields.push(`mastery_level = $${paramCount}`);
                values.push(data.mastery_level);
                paramCount++;
            }
            
            if (data.last_review !== undefined) {
                fields.push(`last_review = $${paramCount}`);
                values.push(data.last_review);
                paramCount++;
            }
            
            if (fields.length > 0) {
                const query = `
                    UPDATE user_vocabulary 
                    SET ${fields.join(', ')}
                    WHERE user_id = $1 AND word_id = $2 AND user_languages_id = $3
                    RETURNING word_id, user_languages_id, mastery_level, last_review, created_at
                `;
                
                const result = await pool.query(query, values);
                if (result.rows.length > 0) {
                    results.push(result.rows[0]);
                }
            }
        }
        
        // Reshape results to match expected format
        return results.reduce((acc, row) => {
            acc[row.word_id] = {
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