import request from 'supertest';
import app from '../app.js';
import { issueTokenPair } from '../utils/tokens.js';
import { createTestUser, deleteTestUser, closeTestPool } from './helpers/testUser.js';

describe('POST /api/v1/logout', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser('logout');
  });

  afterAll(async () => {
    await deleteTestUser(user.id);
    await closeTestPool();
  });

  test('revokes only the presented token\'s family, not other device sessions', async () => {
    const deviceA = await issueTokenPair(user);
    const deviceB = await issueTokenPair(user);

    const logoutRes = await request(app).post('/api/v1/logout').send({ refreshToken: deviceA.refreshToken });
    expect(logoutRes.status).toBe(200);

    // Device A's session is dead.
    const refreshA = await request(app).post('/api/v1/refresh').send({ refreshToken: deviceA.refreshToken });
    expect(refreshA.status).toBe(403);

    // Device B's session is untouched.
    const refreshB = await request(app).post('/api/v1/refresh').send({ refreshToken: deviceB.refreshToken });
    expect(refreshB.status).toBe(200);
  });

  test('missing token returns 204 with no error', async () => {
    const res = await request(app).post('/api/v1/logout').send({});
    expect(res.status).toBe(204);
  });

  test('logout is idempotent for an already-dead token', async () => {
    const { refreshToken } = await issueTokenPair(user);
    await request(app).post('/api/v1/logout').send({ refreshToken });

    const secondLogout = await request(app).post('/api/v1/logout').send({ refreshToken });
    expect(secondLogout.status).toBe(200);
  });
});
