import pool from '../config/db.js';

const refreshTokensModel = {
  // Create the first row of a new rotation family (login/register).
  async createFamily({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address, last_used_at)
      VALUES ($1, $2, $3, $4, $5, now())
      RETURNING *
    `;
    const values = [userId, tokenHash, expiresAt, userAgent || null, ipAddress || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  },


  // The core atomic operation behind POST /refresh. Runs in a transaction
  // with row-level locking so concurrent refresh attempts against the same
  // token can't race each other into a false reuse-detection trigger.
  //
  // Returns one of:
  //   { status: 'not_found' }
  //   { status: 'reuse_detected', userId, familyId }
  //   { status: 'expired', userId, familyId }
  //   { status: 'ok', userId, newRowId }
  async rotate(oldTokenHash, newTokenHash, { userAgent, ipAddress } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        'SELECT * FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE',
        [oldTokenHash]
      );
      const row = rows[0];

      if (!row) {
        await client.query('ROLLBACK');
        return { status: 'not_found' };
      }

      if (row.revoked_at) {
        // The token being presented was already rotated away (or already
        // revoked for some other reason) - this is a replay. Kill the
        // whole family immediately.
        await client.query(
          'UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL',
          [row.family_id]
        );
        await client.query('COMMIT');
        return { status: 'reuse_detected', userId: row.user_id, familyId: row.family_id };
      }

      if (new Date(row.expires_at).getTime() < Date.now()) {
        await client.query(
          'UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL',
          [row.family_id]
        );
        await client.query('COMMIT');
        return { status: 'expired', userId: row.user_id, familyId: row.family_id };
      }

      // Valid - rotate. The new row copies expires_at verbatim from the
      // old one, so the absolute cap never resets on activity.
      const insertResult = await client.query(
        `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at, user_agent, ip_address, last_used_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         RETURNING id`,
        [row.user_id, row.family_id, newTokenHash, row.expires_at, userAgent || null, ipAddress || null]
      );
      const newRowId = insertResult.rows[0].id;

      await client.query(
        'UPDATE refresh_tokens SET revoked_at = now(), replaced_by_id = $1 WHERE id = $2',
        [newRowId, row.id]
      );

      await client.query('COMMIT');
      return { status: 'ok', userId: row.user_id, newRowId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },


  // Revoke every active token in a family (logout of one device/session).
  async revokeFamily(familyId) {
    const query = 'UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL';
    await pool.query(query, [familyId]);
  },


  // Revoke every active family for a user (password reset - log out everywhere).
  async revokeAllForUser(userId) {
    const query = 'UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL';
    await pool.query(query, [userId]);
  },


  // Status-agnostic lookup by hash, used by logout to find which family a
  // presented token belongs to even if it's one rotation behind the tip.
  async findByHash(tokenHash) {
    const query = 'SELECT * FROM refresh_tokens WHERE token_hash = $1';
    const result = await pool.query(query, [tokenHash]);
    return result.rows[0];
  },


  // Active sessions for a user - not wired to any endpoint yet, but the
  // schema/query make a future "manage sessions" screen trivial to add.
  async findActiveSessionsForUser(userId) {
    const query = `
      SELECT id, family_id, created_at, last_used_at, user_agent, ip_address, expires_at
      FROM refresh_tokens
      WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > now()
      ORDER BY last_used_at DESC NULLS LAST
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },
};

export default refreshTokensModel;
