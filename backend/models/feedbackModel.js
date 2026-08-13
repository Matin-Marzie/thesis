import pool from '../config/db.js';

const feedbackModel = {
  async create({ category, message, email, userAgent, ipAddress }) {
    const query = `
      INSERT INTO feedback (category, message, email, user_agent, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, category, message, email, created_at
    `;
    const values = [category, message, email || null, userAgent || null, ipAddress || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
};

export default feedbackModel;
