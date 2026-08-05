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
            created_at,
            review_count,
            next_review_at
        FROM user_vocabulary
        WHERE user_id = $1 AND user_languages_id = $2
    `;

        const result = await pool.query(query, [userId, userLanguagesId]);
        // reshape → { wordId: { mastery_level, last_review, created_at, review_count, next_review_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
            };
            return acc;
        }, {});
    },

    // Add vocabulary words for user and return only current language words
    async add(userId, userVocabulary, currentUserLanguagesId) {
        const values = [];
        const placeholders = userVocabulary.map(([wordId, data], i) => {
            const base = i * 8;
            values.push(
                userId,
                Number(wordId),
                currentUserLanguagesId,
                data.mastery_level,
                data.last_review,
                data.created_at,
                data.review_count ?? 0,
                data.next_review_at ?? data.created_at
            );
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
        }).join(',');
        // Add filter param
        values.push(currentUserLanguagesId);
        const query = `
            WITH inserted AS (
            INSERT INTO user_vocabulary
                (user_id, word_id, user_languages_id, mastery_level, last_review, created_at, review_count, next_review_at)
            VALUES ${placeholders}
            RETURNING *
            )
            SELECT
                word_id,
                user_languages_id,
                mastery_level,
                last_review,
                created_at,
                review_count,
                next_review_at
            FROM inserted
            WHERE user_languages_id = $${values.length};
        `;
        const result = await pool.query(query, values);
        // reshape → { wordId: { mastery_level, last_review, created_at, review_count, next_review_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
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

            if (data.review_count !== undefined) {
                fields.push(`review_count = $${paramCount}`);
                values.push(data.review_count);
                paramCount++;
            }

            if (data.next_review_at !== undefined) {
                fields.push(`next_review_at = $${paramCount}`);
                values.push(data.next_review_at);
                paramCount++;
            }

            if (fields.length > 0) {
                const query = `
                    UPDATE user_vocabulary
                    SET ${fields.join(', ')}
                    WHERE user_id = $1 AND word_id = $2 AND user_languages_id = $3
                    RETURNING word_id, user_languages_id, mastery_level, last_review, created_at, review_count, next_review_at
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
                review_count: row.review_count,
                next_review_at: row.next_review_at,
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
     * Bulk add vocabulary for words below a given proficiency level (optionally
     * starting above another level, to seed only the gap between two levels).
     * Used during registration to auto-add words the user already "knows", and
     * during login-merge to backfill the gap when a language's proficiency
     * level gets bumped up without a fresh registration.
     *
     * mastery_level is derived per word from how many levels below the target
     * proficiencyLevel the word's own level is (distance 1 = the level just below target):
     *   distance 1  -> 3 (Understood)
     *   distance 2  -> 4 (Usable)
     *   distance 3+ -> 5 (Mastered), capped there
     * The intuition: the closer a word's level is to the target, the more
     * recently it would've been learned and the less reinforced it is;
     * more foundational levels further below are assumed well-known.
     *
     * @param {number} userId - User's ID
     * @param {number} userLanguagesId - user_languages ID for the current language
     * @param {number} learningLanguageId - Learning language ID
     * @param {string} proficiencyLevel - Level to seed up to (N, A1, A2, B1, B2, C1, C2)
     * @param {Date|string} joinedDate - Date to use for created_at and last_review
     * @param {string} fromProficiencyLevel - Level to seed from, exclusive (default 'N', i.e. seed everything below proficiencyLevel)
     * @returns {Object} Vocabulary object { wordId: { mastery_level, last_review, created_at } }
     */
    async addByProficiencyLevel(userId, userLanguagesId, learningLanguageId, proficiencyLevel, joinedDate = null, fromProficiencyLevel = 'N') {
        // Proficiency levels in order - get all levels below the target level
        const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const levelIndex = PROFICIENCY_LEVELS.indexOf(proficiencyLevel);
        const fromIndex = Math.max(0, PROFICIENCY_LEVELS.indexOf(fromProficiencyLevel));

        // If target level is at or below the starting level (or not found), there's no gap to seed
        if (levelIndex <= fromIndex) {
            return {};
        }

        // Get levels in [fromProficiencyLevel, proficiencyLevel)
        const levelsBelowProficiency = PROFICIENCY_LEVELS.slice(fromIndex, levelIndex);

        const masteryLevelForDistance = (distance) => {
            if (distance <= 1) return 3; // Understood
            if (distance === 2) return 4; // Usable
            return 5; // Mastered
        };

        // Use joinedDate if provided, otherwise use NOW()
        const dateValue = joinedDate || new Date().toISOString();

        // Build a CASE w.level WHEN ... THEN ... END so each word gets a
        // mastery_level based on the distance of its own level from the
        // target, instead of one flat value for everything seeded.
        const values = [userId, userLanguagesId, learningLanguageId, dateValue];
        const caseWhens = levelsBelowProficiency.map((level) => {
            const distance = levelIndex - PROFICIENCY_LEVELS.indexOf(level);
            values.push(level, masteryLevelForDistance(distance));
            const levelParam = `$${values.length - 1}`;
            const masteryParam = `$${values.length}`;
            return `WHEN ${levelParam} THEN ${masteryParam}`;
        }).join(' ');
        values.push(levelsBelowProficiency);
        const levelsArrayParam = `$${values.length}`;

        const query = `
            INSERT INTO user_vocabulary (user_id, word_id, user_languages_id, mastery_level, last_review, created_at, review_count, next_review_at)
            SELECT $1, w.id, $2,
                (CASE w.level ${caseWhens} END)::smallint,
                $4, $4, 0, $4
            FROM words w
            WHERE w.language_id = $3
              AND w.level = ANY(${levelsArrayParam})
            RETURNING word_id, mastery_level, last_review, created_at, review_count, next_review_at
        `;

        const result = await pool.query(query, values);

        // Reshape to { wordId: { mastery_level, last_review, created_at, review_count, next_review_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
            };
            return acc;
        }, {});
    },
};

export default userVocabularyModel;