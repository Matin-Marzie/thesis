import pool from '../config/db.js';

// Field order used whenever a controller serializes user_vocabulary (keyed
// by word_id) as columnar JSON - see utils/columnar.js's toColumnarFromKeyedObject.
export const VOCABULARY_FIELD_COLUMNS = ['last_review', 'created_at', 'review_count', 'next_review_at', 'stability', 'difficulty', 'lapses', 'fsrs_state', 'learning_steps'];

const userVocabularyModel = {

     // fetch user vocabulary of current language
    async get(userId, userLanguagesId) {
        const query = `
        SELECT
            word_id,
            user_languages_id,
            last_review,
            created_at,
            review_count,
            next_review_at,
            stability,
            difficulty,
            lapses,
            fsrs_state,
            learning_steps
        FROM user_vocabulary
        WHERE user_id = $1 AND user_languages_id = $2
    `;

        const result = await pool.query(query, [userId, userLanguagesId]);
        // reshape → { wordId: { last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
                stability: row.stability,
                difficulty: row.difficulty,
                lapses: row.lapses,
                fsrs_state: row.fsrs_state,
                learning_steps: row.learning_steps,
            };
            return acc;
        }, {});
    },

    // Add vocabulary words for user and return only current language words
    async add(userId, userVocabulary, currentUserLanguagesId) {
        const values = [];
        const placeholders = userVocabulary.map(([wordId, data], i) => {
            const base = i * 12;
            values.push(
                userId,
                Number(wordId),
                currentUserLanguagesId,
                data.last_review,
                data.created_at,
                data.review_count ?? 0,
                data.next_review_at ?? data.created_at,
                data.stability ?? null,
                data.difficulty ?? null,
                data.lapses ?? 0,
                data.fsrs_state ?? 0,
                data.learning_steps ?? 0
            );
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12})`;
        }).join(',');
        // Add filter param
        values.push(currentUserLanguagesId);
        const query = `
            WITH inserted AS (
            INSERT INTO user_vocabulary
                (user_id, word_id, user_languages_id, last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps)
            VALUES ${placeholders}
            RETURNING *
            )
            SELECT
                word_id,
                user_languages_id,
                last_review,
                created_at,
                review_count,
                next_review_at,
                stability,
                difficulty,
                lapses,
                fsrs_state,
                learning_steps
            FROM inserted
            WHERE user_languages_id = $${values.length};
        `;
        const result = await pool.query(query, values);
        // reshape → { wordId: { last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
                stability: row.stability,
                difficulty: row.difficulty,
                lapses: row.lapses,
                fsrs_state: row.fsrs_state,
                learning_steps: row.learning_steps,
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

            if (data.stability !== undefined) {
                fields.push(`stability = $${paramCount}`);
                values.push(data.stability);
                paramCount++;
            }

            if (data.difficulty !== undefined) {
                fields.push(`difficulty = $${paramCount}`);
                values.push(data.difficulty);
                paramCount++;
            }

            if (data.lapses !== undefined) {
                fields.push(`lapses = $${paramCount}`);
                values.push(data.lapses);
                paramCount++;
            }

            if (data.fsrs_state !== undefined) {
                fields.push(`fsrs_state = $${paramCount}`);
                values.push(data.fsrs_state);
                paramCount++;
            }

            if (data.learning_steps !== undefined) {
                fields.push(`learning_steps = $${paramCount}`);
                values.push(data.learning_steps);
                paramCount++;
            }

            if (fields.length > 0) {
                const query = `
                    UPDATE user_vocabulary
                    SET ${fields.join(', ')}
                    WHERE user_id = $1 AND word_id = $2 AND user_languages_id = $3
                    RETURNING word_id, user_languages_id, last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps
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
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
                stability: row.stability,
                difficulty: row.difficulty,
                lapses: row.lapses,
                fsrs_state: row.fsrs_state,
                learning_steps: row.learning_steps,
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
     * Seeded words go straight into FSRS Review state (not New), with an
     * initial stability based on how many levels below the target
     * proficiencyLevel the word's own level is (distance 1 = the level just
     * below target):
     *   distance 1  -> 7 days
     *   distance 2  -> 20 days
     *   distance 3+ -> 60 days
     * The intuition: the closer a word's level is to the target, the more
     * recently it would've been learned and the less reinforced it is;
     * more foundational levels further below are assumed well-known.
     *
     * @param {number} userId - User's ID
     * @param {number} userLanguagesId - user_languages ID for the current language
     * @param {number} learningLanguageId - Learning language ID
     * @param {string} proficiencyLevel - Level to seed up to (N, A1, A2, B1, B2, C1, C2, EX)
     * @param {Date|string} joinedDate - Date to use for created_at and last_review
     * @param {string} fromProficiencyLevel - Level to seed from, exclusive (default 'N', i.e. seed everything below proficiencyLevel)
     * @returns {Object} Vocabulary object { wordId: { last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps } }
     */
    async addByProficiencyLevel(userId, userLanguagesId, learningLanguageId, proficiencyLevel, joinedDate = null, fromProficiencyLevel = 'N') {
        // Proficiency levels in order - get all levels below the target level
        const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'EX'];
        const levelIndex = PROFICIENCY_LEVELS.indexOf(proficiencyLevel);
        const fromIndex = Math.max(0, PROFICIENCY_LEVELS.indexOf(fromProficiencyLevel));

        // If target level is at or below the starting level (or not found), there's no gap to seed
        if (levelIndex <= fromIndex) {
            return {};
        }

        // Get levels in [fromProficiencyLevel, proficiencyLevel)
        const levelsBelowProficiency = PROFICIENCY_LEVELS.slice(fromIndex, levelIndex);

        const stabilityForDistance = (distance) => {
            if (distance <= 1) return 7; // days
            if (distance === 2) return 20;
            return 60;
        };
        const SEEDED_DIFFICULTY = 5.0; // mid-scale default (FSRS difficulty ranges ~1-10)
        const SEEDED_FSRS_STATE = 2; // Review

        // Use joinedDate if provided, otherwise use NOW()
        const dateValue = joinedDate || new Date().toISOString();

        // Build a CASE w.level WHEN ... THEN ... END block so each word gets
        // an initial FSRS stability based on the distance of its own level
        // from the target, instead of one flat value for everything seeded.
        const values = [userId, userLanguagesId, learningLanguageId, dateValue];
        let stabilityCaseWhens = '';
        for (const level of levelsBelowProficiency) {
            const distance = levelIndex - PROFICIENCY_LEVELS.indexOf(level);
            values.push(level, stabilityForDistance(distance));
            const levelParam = `$${values.length - 1}`;
            const stabilityParam = `$${values.length}`;
            stabilityCaseWhens += ` WHEN ${levelParam} THEN ${stabilityParam}`;
        }
        values.push(levelsBelowProficiency);
        const levelsArrayParam = `$${values.length}`;
        values.push(SEEDED_DIFFICULTY, SEEDED_FSRS_STATE);
        const difficultyParam = `$${values.length - 1}`;
        const fsrsStateParam = `$${values.length}`;

        const query = `
            INSERT INTO user_vocabulary (user_id, word_id, user_languages_id, last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps)
            SELECT $1, w.id, $2,
                $4, $4, 0,
                $4::timestamptz + (INTERVAL '1 day' * (CASE w.level${stabilityCaseWhens} END)::double precision),
                (CASE w.level${stabilityCaseWhens} END)::double precision,
                ${difficultyParam}, 0, ${fsrsStateParam}, 0
            FROM words w
            WHERE w.language_id = $3
              AND w.level = ANY(${levelsArrayParam})
            RETURNING word_id, last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps
        `;

        const result = await pool.query(query, values);

        // Reshape to { wordId: { last_review, created_at, review_count, next_review_at, stability, difficulty, lapses, fsrs_state, learning_steps } }
        return result.rows.reduce((acc, row) => {
            acc[row.word_id] = {
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
                stability: row.stability,
                difficulty: row.difficulty,
                lapses: row.lapses,
                fsrs_state: row.fsrs_state,
                learning_steps: row.learning_steps,
            };
            return acc;
        }, {});
    },
};

export default userVocabularyModel;
