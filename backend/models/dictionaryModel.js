import pool from "../config/db.js";

const dictionaryModel = {

    // Fetch all learning language words, with their native language translations
    async getWordsWithTranslations(learning_language_id, native_language_id) {
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

            ARRAY_AGG(t.level)
                FILTER (WHERE tw.id IS NOT NULL) AS translation_levels

        FROM words w
        LEFT JOIN translations t
            ON t.word_id = w.id
        LEFT JOIN words tw
            ON tw.id = t.translation_word_id
        AND tw.language_id = $2   -- native_language_id

        WHERE w.language_id = $1     -- learning_language_id

        GROUP BY w.id;
        `;

        const result = await pool.query(query, [learning_language_id, native_language_id]);
        return result.rows;
    },

    // Get all words of a language
    async getWordsByLanguageID(language_id) {
        const query = `
            SELECT
                w.*
            FROM words w
            WHERE w.language_id = $1
        `;

        const result = await pool.query(query, [language_id]);
        return result.rows;
    },

    async getWordsWithTranslations_byLanguageCodes(learning_language_code, native_language_code) {
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
            ARRAY_AGG(t.level)
                FILTER (WHERE tw.id IS NOT NULL) AS translation_levels
        FROM words w

        JOIN languages ll
            ON ll.id = w.language_id
        AND ll.code = $1              -- learning_language_code

        LEFT JOIN translations t
            ON t.word_id = w.id

        LEFT JOIN words tw
            ON tw.id = t.translation_word_id

        LEFT JOIN languages tl
            ON tl.id = tw.language_id
        AND tl.code = $2             -- translation_language_code

        GROUP BY w.id;
        `;

        const result = await pool.query(query, [learning_language_code, native_language_code]);
        return result.rows;
    },

    
    async getWordsByLanguageCode(language_code) {
        const query = `
            SELECT w.*
            FROM words w
            JOIN languages l ON l.id = w.language_id
            WHERE l.code = $1
            `;
        const result = await pool.query(query, [language_code]);
        return result.rows;
    }


};

export default dictionaryModel;