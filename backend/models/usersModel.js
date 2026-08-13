import pool from '../config/db.js';

const usersModel = {
  // Create a new user
  async create(userData) {
    const {
      email,
      password_hash,
      username,
      first_name,
      last_name,
      google_id,
      profile_picture,
      age,
      preferences,
      energy,
      coins,
      email_verified,
    } = userData;
    const query = `
      INSERT INTO users (
        email, password_hash, username, age, preferences, first_name, last_name,
        google_id, profile_picture, energy, coins, email_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, email, username, first_name, last_name,
                google_id, profile_picture, joined_date, energy, coins, age, preferences, email_verified
    `;
    const values = [
      email,
      password_hash,
      username,
      age,
      preferences || null,
      first_name,
      last_name || null,
      google_id || null,
      profile_picture || null,
      energy,
      coins,
      email_verified ?? false,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },


  // Bump last_login to now - call only on real login/register (issueTokenPair),
  // never on a silent token refresh.
  async touchLastLogin(userId) {
    const query = 'UPDATE users SET last_login = now() WHERE id = $1';
    await pool.query(query, [userId]);
  },


  // Find user by ID
  async get(id) {
    const query = `
      SELECT id, email, username, first_name, last_name,
             profile_picture, joined_date, last_login, energy, coins, google_id, email_verified
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },


  // Find user by username
  async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  },


  // Find user by email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },


  // Find user by Google ID
  async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  },


  // Set a new password hash. Caller is responsible for also calling
  // refreshTokensModel.revokeAllForUser(userId) - a password reset should
  // log out every device, not just clear a single column.
  async updatePassword(userId, passwordHash) {
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id, email
    `;
    const result = await pool.query(query, [passwordHash, userId]);
    return result.rows[0];
  },


  // Permanently delete a user (hard delete). Related rows (user_languages,
  // user_vocabulary, reels, reel_interactions, reel_reports, ...) are
  // removed via ON DELETE CASCADE. The user's uploaded reel video files on
  // disk are NOT
  // covered by this - caller is responsible for removing
  // uploads/reels/{userId}/ after this resolves.
  async delete(userId) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, email';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },


  // Update user profile, energy, or coins
  async updateProfile(userId, updates) {
    const allowedFields = ['first_name', 'last_name', 'username', 'profile_picture', 'energy', 'coins', 'age', 'preferences', 'notifications'];
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

    values.push(userId);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, username, first_name, last_name,
                profile_picture, joined_date, last_login, energy, coins,
                age, preferences, notifications
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  },
};

export default usersModel;
