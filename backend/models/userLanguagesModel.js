import pool from '../config/db.js';

const userLanguagesModel = {
  // Create new user language entries
  // languages: [{ native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language }]
  async addUserLanguages(userId, languages) {
    const values = [];
    const placeholders = languages.map((l, i) => {
      const base = i * 7;
      values.push(
        userId,
        l.native_language_id,
        l.learning_language_id,
        l.created_at,
        l.proficiency_level,
        l.experience,
        l.is_current_language // database sets to false by default
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
    }).join(',');

    const query = `
    WITH inserted AS (
      INSERT INTO user_languages
        (user_id, native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language)
      VALUES
        ${placeholders}
      RETURNING *
    )
    SELECT i.*, 
          bl.name AS native_language_name, bl.code AS native_language_code,
          ll.name AS learning_language_name, ll.code AS learning_language_code
    FROM inserted i
    JOIN languages bl ON i.native_language_id = bl.id
    JOIN languages ll ON i.learning_language_id = ll.id;
    `;

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get all user languages
  async findByUserId(userId) {
    const query = `
      SELECT ul.*, 
             bl.name as native_language_name, bl.code as native_language_code,
             ll.name as learning_language_name, ll.code as learning_language_code
      FROM user_languages ul
      JOIN languages bl ON ul.native_language_id = bl.id
      JOIN languages ll ON ul.learning_language_id = ll.id
      WHERE ul.user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  },















  // Delete a user language entry
 async delete(userId, native_language_id, learning_language_id) {
    const query = `
      DELETE FROM user_languages
      WHERE native_language_id = $1 AND learning_language_id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [native_language_id, learning_language_id, userId]);
    return result.rows[0];
  },


  // Havn't used yet
  // Update user language progress
  async updateProgress(userLanguageId, updates) {
    const allowedFields = ['proficiency_level', 'experience', 'score'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(userLanguageId);
    const query = `
      UPDATE user_languages 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Havn't used yet
  // Get specific user language
  async findById(userLanguageId) {
    const query = `
      SELECT ul.*, 
             bl.name as native_language_name, bl.code as base_language_code,
             ll.name as learning_language_name, ll.code as learning_language_code
      FROM user_languages ul
      JOIN languages bl ON ul.native_language_id = bl.id
      JOIN languages ll ON ul.learning_language_id = ll.id
      WHERE ul.id = $1
    `;

    const result = await pool.query(query, [userLanguageId]);
    return result.rows[0];
  },

  // Havn't used yet
  // Check if user already has this language combination
  async findByUserAndLanguages(userId, learning_language_id) {
    const query = `
      SELECT * FROM user_languages 
      WHERE user_id = $1 AND learning_language_id = $2
    `;

    const result = await pool.query(query, [userId, learning_language_id]);
    return result.rows[0];
  },
};

export default userLanguagesModel;
