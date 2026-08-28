import pool from "../config/db.js";

const lettersModel = {

    // Get all letters of a language, ordered by id (insertion/alphabetical order)
    async getLettersByLanguageCode(language_code) {
        const query = `
            SELECT l.*
            FROM letters l
            JOIN languages lang ON lang.id = l.language_id
            WHERE lang.code = $1
            ORDER BY l.id
        `;

        const result = await pool.query(query, [language_code]);
        return result.rows;
    },
};

export default lettersModel;
