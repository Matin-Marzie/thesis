import pool from '../config/db.js';

const passwordResetModel = {
  // Replaces any pending code for this email (resend = overwrite, not append)
  async upsertCode(email, codeHash, expiresAt) {
    const query = `
      INSERT INTO password_reset_codes (email, code_hash, expires_at, attempts, created_at)
      VALUES ($1, $2, $3, 0, now())
      ON CONFLICT (email) DO UPDATE SET
        code_hash = EXCLUDED.code_hash,
        expires_at = EXCLUDED.expires_at,
        attempts = 0,
        created_at = now()
      RETURNING email, expires_at, created_at
    `;
    const result = await pool.query(query, [email.toLowerCase(), codeHash, expiresAt]);
    return result.rows[0];
  },

  async getByEmail(email) {
    const query = 'SELECT * FROM password_reset_codes WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0];
  },

  async incrementAttempts(email) {
    const query = `
      UPDATE password_reset_codes
      SET attempts = attempts + 1
      WHERE email = $1
      RETURNING attempts
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0]?.attempts;
  },

  async deleteByEmail(email) {
    await pool.query('DELETE FROM password_reset_codes WHERE email = $1', [email.toLowerCase()]);
  },
};

export default passwordResetModel;
