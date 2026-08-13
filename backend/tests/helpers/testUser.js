import usersModel from '../../models/usersModel.js';
import pool from '../../config/db.js';

// Creates a throwaway user scoped to one test file. Callers must delete it
// (deleteTestUser) in an afterAll - refresh_tokens rows cascade-delete with
// the user via the FK's ON DELETE CASCADE, so no separate cleanup is needed
// there.
export const createTestUser = async (label) => {
  const unique = `${label}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return usersModel.create({
    email: `${unique}@test.local`,
    password_hash: null,
    username: unique,
    first_name: 'Test',
    last_name: null,
    google_id: null,
    profile_picture: null,
    age: null,
    preferences: null,
    energy: 100,
    coins: 0,
    email_verified: true,
  });
};

export const deleteTestUser = async (userId) => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};

// Direct DB manipulation for the absolute-cap test - simulating "90 days
// have passed" without waiting or monkey-patching env vars mid-test.
export const forceExpireToken = async (rawToken, hashRefreshToken) => {
  await pool.query(
    "UPDATE refresh_tokens SET expires_at = now() - interval '1 day' WHERE token_hash = $1",
    [hashRefreshToken(rawToken)]
  );
};

export const closeTestPool = async () => {
  await pool.end();
};
