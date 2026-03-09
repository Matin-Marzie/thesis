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

    /**
     * Bulk add vocabulary for words below a given proficiency level.
     * Used during registration to auto-add words the user already "knows".
     * @param {number} userId - User's ID
     * @param {number} userLanguagesId - user_languages ID for the current language
     * @param {number} learningLanguageId - Learning language ID
     * @param {string} proficiencyLevel - User's proficiency level (N, A1, A2, B1, B2, C1, C2)
     * @param {number} masteryLevel - Mastery level to assign (default: 3 = "Understood")
     * @param {Date|string} joinedDate - User's joined date for created_at and last_review
     * @returns {Object} Vocabulary object { wordId: { mastery_level, last_review, created_at } }
     */
    async addByProficiencyLevel(userId, userLanguagesId, learningLanguageId, proficiencyLevel, masteryLevel = 3, joinedDate = null) {
        // Proficiency levels in order - get all levels below the user's level
        const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const levelIndex = PROFICIENCY_LEVELS.indexOf(proficiencyLevel);
        
        // If level is 'N' (index 0) or not found, don't add any words
        if (levelIndex <= 0) {
            return {};
        }
        
        // Get levels below the user's proficiency
        const levelsBelowProficiency = PROFICIENCY_LEVELS.slice(0, levelIndex);
        
        // Use joinedDate if provided, otherwise use NOW()
        const dateValue = joinedDate || new Date().toISOString();
        
        const query = `
            INSERT INTO user_vocabulary (user_id, word_id, user_languages_id, mastery_level, last_review, created_at)
            SELECT $1, w.id, $2, $3, $6, $6
            FROM words w
            WHERE w.language_id = $4
              AND w.level = ANY($5)
            RETURNING word_id, mastery_level, last_review, created_at
        `;
        
        const result = await pool.query(query, [
            userId,
            userLanguagesId,
            masteryLevel,
            learningLanguageId,
            levelsBelowProficiency,
            dateValue
        ]);
        
        // Reshape to { wordId: { mastery_level, last_review, created_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
            };
            return acc;
        }, {});
    },
};

export default userVocabularyModel;