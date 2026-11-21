import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, auth, clearDb, connectTestDb, disconnectTestDb, registerUser } from './helpers.js';

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearDb);

describe('Auth API', () => {
  it('registers a user, hashes the password and never returns it', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Asha', email: 'ASHA@Example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe('asha@example.com');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects duplicate registration with 409', async () => {
    await registerUser('dup@example.com');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other', email: 'dup@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('rejects weak password and invalid email with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'nope', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    await registerUser('login@example.com');
    const ok = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'password123' });
    expect(ok.status).toBe(200);
    expect(ok.body.data.token).toBeTruthy();

    const bad = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'wrongpass' });
    expect(bad.status).toBe(401);
    const unknown = await request(app).post('/api/auth/login').send({ email: 'x@example.com', password: 'password123' });
    expect(unknown.status).toBe(401);
    expect(unknown.body.message).toBe(bad.body.message);
  });

  it('GET /me returns the current user, and 401 without or with a bad token', async () => {
    const { token } = await registerUser('me@example.com');
    const ok = await request(app).get('/api/auth/me').set(auth(token));
    expect(ok.status).toBe(200);
    expect(ok.body.data.user.email).toBe('me@example.com');
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set(auth('garbage'))).status).toBe(401);
  });
});
