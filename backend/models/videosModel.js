import pool from "../config/db.js";

const videosModel = {

    // Get the curated video collection for a learning language, oldest-added first
    async getVideosByLanguageCode(language_code) {
        const query = `
            SELECT v.id, v.youtube_url, v.title, v.created_at
            FROM grammer_videos v
            JOIN languages l ON l.id = v.learning_language_id
            WHERE l.code = $1
            ORDER BY v.id
        `;

        const result = await pool.query(query, [language_code]);
        return result.rows;
    },
};

export default videosModel;
