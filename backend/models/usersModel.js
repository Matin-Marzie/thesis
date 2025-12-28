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
    } = userData;
    const query = `
      INSERT INTO users (
        email, password_hash, username, age, preferences, first_name, last_name, 
        google_id, profile_picture, energy, coins
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, username, first_name, last_name, 
                google_id, profile_picture, joined_date, energy, coins, age, preferences
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
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },


  // Update refresh token
  async updateRefreshToken(userId, refreshToken) {
    const query = 'UPDATE users SET refresh_token = $1 WHERE id = $2';
    await pool.query(query, [refreshToken, userId]);
  },


  // Find user by ID
  async get(id) {
    const query = `
      SELECT id, email, username, first_name, last_name, 
             profile_picture, joined_date, last_login, energy, coins, google_id
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


  // Find user by refresh token
  async findByRefreshToken(refreshToken) {
    const query = 'SELECT * FROM users WHERE refresh_token = $1';
    const result = await pool.query(query, [refreshToken]);
    return result.rows[0];
  },


  // Find user by Google ID
  async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  },

  // Clear refresh token (logout)
  async clearRefreshToken(userId) {
    const query = 'UPDATE users SET refresh_token = NULL WHERE id = $1';
    await pool.query(query, [userId]);
  },





  






  // Update user profile, energy, or coins
  async updateProfile(userId, updates) {
    const allowedFields = ['first_name', 'last_name', 'username', 'profile_picture', 'energy', 'coins'];
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
                profile_picture, joined_date, last_login, energy, coins
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },
};

export default usersModel;
