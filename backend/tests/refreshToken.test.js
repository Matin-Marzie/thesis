import request from 'supertest';
import app from '../app.js';
import { issueTokenPair, hashRefreshToken } from '../utils/tokens.js';
import refreshTokensModel from '../models/refreshTokensModel.js';
import { createTestUser, deleteTestUser, forceExpireToken, closeTestPool } from './helpers/testUser.js';

describe('POST /api/v1/refresh', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser('refresh');
  });

  afterAll(async () => {
    await deleteTestUser(user.id);
    await closeTestPool();
  });

  test('rotates the refresh token on a valid request', async () => {
    const { refreshToken } = await issueTokenPair(user);

    const res = await request(app)
      .post('/api/v1/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.refreshToken).toEqual(expect.any(String));
    expect(res.body.data.refreshToken).not.toBe(refreshToken);

    // The original token is now dead - using it again is a reuse, not a
    // simple "invalid token".
    const replay = await request(app)
      .post('/api/v1/refresh')
      .send({ refreshToken });

    expect(replay.status).toBe(403);
    expect(replay.body.code).toBe('REFRESH_TOKEN_REUSED');
  });

  test('reuse detection revokes the whole family, including the token that replaced the reused one', async () => {
    const { refreshToken: tokenA } = await issueTokenPair(user);

    const rotated = await request(app).post('/api/v1/refresh').send({ refreshToken: tokenA });
    const tokenB = rotated.body.data.refreshToken;

    // Replay the dead original token A - should be flagged as reuse and
    // kill the family, including the still-fresh token B.
    const reuse = await request(app).post('/api/v1/refresh').send({ refreshToken: tokenA });
    expect(reuse.status).toBe(403);
    expect(reuse.body.code).toBe('REFRESH_TOKEN_REUSED');

    const afterReuse = await request(app).post('/api/v1/refresh').send({ refreshToken: tokenB });
    expect(afterReuse.status).toBe(403);
  });

  test('a token past its absolute cap is rejected as expired, not silently renewed', async () => {
    const { refreshToken } = await issueTokenPair(user);
    await forceExpireToken(refreshToken, hashRefreshToken);

    const res = await request(app).post('/api/v1/refresh').send({ refreshToken });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('REFRESH_TOKEN_EXPIRED');
  });

  test('an unknown/garbage token is rejected distinctly from reuse', async () => {
    const res = await request(app).post('/api/v1/refresh').send({ refreshToken: 'not-a-real-token' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('REFRESH_TOKEN_INVALID');
  });

  test('missing token is rejected with 401', async () => {
    const res = await request(app).post('/api/v1/refresh').send({});
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('REFRESH_TOKEN_MISSING');
  });

  test('two device sessions for the same user are independent', async () => {
    const deviceA = await issueTokenPair(user, { userAgent: 'device-a' });
    const deviceB = await issueTokenPair(user, { userAgent: 'device-b' });

    const refreshA = await request(app).post('/api/v1/refresh').send({ refreshToken: deviceA.refreshToken });
    expect(refreshA.status).toBe(200);

    // Device B's original token is untouched by device A's rotation.
    const refreshB = await request(app).post('/api/v1/refresh').send({ refreshToken: deviceB.refreshToken });
    expect(refreshB.status).toBe(200);
  });

  test('rotation preserves the family expiry (absolute cap does not slide on activity)', async () => {
    const { refreshToken } = await issueTokenPair(user);
    const before = await refreshTokensModel.findByHash(hashRefreshToken(refreshToken));

    const res = await request(app).post('/api/v1/refresh').send({ refreshToken });
    const after = await refreshTokensModel.findByHash(hashRefreshToken(res.body.data.refreshToken));

    expect(new Date(after.expires_at).getTime()).toBe(new Date(before.expires_at).getTime());
  });
});
