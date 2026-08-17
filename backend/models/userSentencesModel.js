import pool from '../config/db.js';

const userSentencesModel = {

     // fetch user's saved sentences for the current language, joined against
     // sentences for display text - user_sentences itself only stores the
     // FK + mastery/review tracking, mirroring how user_vocabulary leaves
     // word details to the words table (there the client already has the
     // full words dictionary preloaded; sentences have no such client-side
     // dictionary, so text is resolved here instead).
    async get(userId, userLanguagesId) {
        const query = `
        SELECT
            us.sentence_id,
            us.user_languages_id,
            us.mastery_level,
            us.last_review,
            us.created_at,
            us.review_count,
            us.next_review_at,
            s.text
        FROM user_sentences us
        JOIN sentences s ON s.id = us.sentence_id
        WHERE us.user_id = $1 AND us.user_languages_id = $2
    `;

        const result = await pool.query(query, [userId, userLanguagesId]);
        // reshape → { sentenceId: { mastery_level, last_review, created_at, review_count, next_review_at, text } }
        return result.rows.reduce((acc, row) => {
            acc[row.sentence_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
                text: row.text,
            };
            return acc;
        }, {});
    },

    // Add saved sentences for user and return only current language sentences
    async add(userId, userSentences, currentUserLanguagesId) {
        const values = [];
        const placeholders = userSentences.map(([sentenceId, data], i) => {
            const base = i * 8;
            values.push(
                userId,
                Number(sentenceId),
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
            INSERT INTO user_sentences
                (user_id, sentence_id, user_languages_id, mastery_level, last_review, created_at, review_count, next_review_at)
            VALUES ${placeholders}
            ON CONFLICT (user_id, sentence_id) DO NOTHING
            RETURNING *
            )
            SELECT
                sentence_id,
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
        // reshape → { sentenceId: { mastery_level, last_review, created_at, review_count, next_review_at } }
        return result.rows.reduce((acc, row) => {
            acc[row.sentence_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
            };
            return acc;
        }, {});
    },


    // Update saved sentences
    async update(userId, userLanguagesId, updates) {
        const results = [];

        for (const [sentenceId, data] of Object.entries(updates)) {
            const fields = [];
            const values = [userId, Number(sentenceId), userLanguagesId];
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
                    UPDATE user_sentences
                    SET ${fields.join(', ')}
                    WHERE user_id = $1 AND sentence_id = $2 AND user_languages_id = $3
                    RETURNING sentence_id, user_languages_id, mastery_level, last_review, created_at, review_count, next_review_at
                `;

                const result = await pool.query(query, values);
                if (result.rows.length > 0) {
                    results.push(result.rows[0]);
                }
            }
        }

        // Reshape results to match expected format
        return results.reduce((acc, row) => {
            acc[row.sentence_id] = {
                mastery_level: row.mastery_level,
                last_review: row.last_review,
                created_at: row.created_at,
                review_count: row.review_count,
                next_review_at: row.next_review_at,
            };
            return acc;
        }, {});
    },

    // delete saved sentences
    async deleteSentences(userId, [sentenceIds]) {
        const query = `
        DELETE FROM user_sentences
        WHERE user_id = $1 AND sentence_id = ANY($2)
        RETURNING *
        `;

        const result = await pool.query(query, [userId, sentenceIds]);
        return result.rows;
    },

    // No addByProficiencyLevel equivalent: sentences has no level column, so
    // there is nothing to bulk-seed at registration/language-add time -
    // user_sentences is only ever populated by explicit user action.
};

export default userSentencesModel;
