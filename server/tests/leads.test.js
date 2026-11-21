import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, auth, clearDb, connectTestDb, disconnectTestDb, registerUser, validLead } from './helpers.js';

let token;
const createLead = (overrides, t = token) =>
  request(app).post('/api/leads').set(auth(t)).send(validLead(overrides));

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(async () => {
  await clearDb();
  ({ token } = await registerUser());
});

describe('Create lead', () => {
  it('creates a lead and normalizes the email', async () => {
    const res = await createLead({ email: '  Deepak@ACME.com ' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('deepak@acme.com');
    expect(res.body.data._id).toBeTruthy();
    expect(res.body.data.createdAt).toBeTruthy();
  });

  it('defaults source to Website and status to New', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set(auth(token))
      .send({ name: 'Priya Nair', email: 'priya@x.com', phone: '9876543210', company: 'X' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('New');
    expect(res.body.data.source).toBe('Website');
  });

  it('rejects an invalid email', async () => {
    const res = await createLead({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('rejects an invalid phone number', async () => {
    const res = await createLead({ phone: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/leads').set(auth(token)).send({});
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'phone', 'company']));
  });

  it('rejects an invalid status and invalid source', async () => {
    expect((await createLead({ status: 'Won' })).status).toBe(400);
    expect((await createLead({ source: 'Billboard' })).status).toBe(400);
  });

  it('rejects a duplicate email for the same user with 409', async () => {
    await createLead();
    const res = await createLead({ name: 'Someone Else' });
    expect(res.status).toBe(409);
  });

  it('ignores a client-supplied userId', async () => {
    const other = await registerUser('other@example.com');
    const res = await createLead({ userId: other.user._id });
    expect(res.status).toBe(201);
    expect(res.body.data.userId).not.toBe(other.user._id);
    const otherList = await request(app).get('/api/leads').set(auth(other.token));
    expect(otherList.body.data).toHaveLength(0);
  });
});

describe('Read leads', () => {
  it('fetches the list with pagination metadata', async () => {
    await createLead({ email: 'a@x.com', name: 'Alpha One' });
    await createLead({ email: 'b@x.com', name: 'Beta Two' });
    const res = await request(app).get('/api/leads').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 2, totalPages: 1 });
  });

  it('fetches a single lead', async () => {
    const created = await createLead();
    const res = await request(app).get(`/api/leads/${created.body.data._id}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Deepak Sharma');
  });

  it('returns 404 for a well-formed ID that does not exist', async () => {
    const res = await request(app).get('/api/leads/64b7f0c2a1b2c3d4e5f60718').set(auth(token));
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid lead ID on get, update and delete', async () => {
    expect((await request(app).get('/api/leads/123').set(auth(token))).status).toBe(400);
    expect((await request(app).put('/api/leads/123').set(auth(token)).send({ name: 'Abc' })).status).toBe(400);
    expect((await request(app).delete('/api/leads/123').set(auth(token))).status).toBe(400);
  });

  it('searches by name, filters by status, and combines both', async () => {
    await createLead({ email: 'a@x.com', name: 'Deepak Sharma', status: 'Qualified' });
    await createLead({ email: 'b@x.com', name: 'Deepak Verma', status: 'New' });
    await createLead({ email: 'c@x.com', name: 'Rahul Gupta', status: 'Qualified' });

    const q = (qs) => request(app).get(`/api/leads?${qs}`).set(auth(token));
    expect((await q('search=deepak')).body.data).toHaveLength(2);
    expect((await q('status=Qualified')).body.data).toHaveLength(2);
    const both = await q('search=deepak&status=Qualified');
    expect(both.body.data).toHaveLength(1);
    expect(both.body.data[0].email).toBe('a@x.com');
    expect((await q('status=Bogus')).status).toBe(400);
  });

  it('treats search input literally (regex characters are escaped)', async () => {
    await createLead({ name: 'Deepak Sharma' });
    const res = await request(app).get('/api/leads?search=.*').set(auth(token));
    expect(res.body.data).toHaveLength(0);
  });

  it('paginates and sorts', async () => {
    for (const n of ['Charlie Z', 'Alice Y', 'Bob X']) {
      await createLead({ name: n, email: `${n[0].toLowerCase()}@x.com` });
    }
    const page1 = await request(app).get('/api/leads?limit=2&page=1&sortBy=name&order=asc').set(auth(token));
    expect(page1.body.data.map((l) => l.name)).toEqual(['Alice Y', 'Bob X']);
    expect(page1.body.pagination).toMatchObject({ total: 3, totalPages: 2 });
    const page2 = await request(app).get('/api/leads?limit=2&page=2&sortBy=name&order=asc').set(auth(token));
    expect(page2.body.data.map((l) => l.name)).toEqual(['Charlie Z']);
  });
});

describe('Update and delete', () => {
  it('updates a lead (including status)', async () => {
    const { body } = await createLead();
    const res = await request(app)
      .put(`/api/leads/${body.data._id}`)
      .set(auth(token))
      .send({ status: 'Qualified', company: 'Acme Global' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Qualified');
    expect(res.body.data.company).toBe('Acme Global');
    expect(res.body.data.name).toBe('Deepak Sharma');
  });

  it('rejects invalid update data and empty updates', async () => {
    const { body } = await createLead();
    const url = `/api/leads/${body.data._id}`;
    expect((await request(app).put(url).set(auth(token)).send({ email: 'bad' })).status).toBe(400);
    expect((await request(app).put(url).set(auth(token)).send({ status: 'Nope' })).status).toBe(400);
    expect((await request(app).put(url).set(auth(token)).send({})).status).toBe(400);
  });

  it('rejects updating to an email that another of the user’s leads uses', async () => {
    await createLead({ email: 'one@x.com' });
    const two = await createLead({ email: 'two@x.com', name: 'Two Person' });
    const res = await request(app).put(`/api/leads/${two.body.data._id}`).set(auth(token)).send({ email: 'one@x.com' });
    expect(res.status).toBe(409);
  });

  it('deletes a lead and then returns 404', async () => {
    const { body } = await createLead();
    const url = `/api/leads/${body.data._id}`;
    expect((await request(app).delete(url).set(auth(token))).status).toBe(200);
    expect((await request(app).get(url).set(auth(token))).status).toBe(404);
  });
});

describe('Stats', () => {
  it('counts leads per status from the database', async () => {
    await createLead({ email: '1@x.com', status: 'New' });
    await createLead({ email: '2@x.com', status: 'New' });
    await createLead({ email: '3@x.com', status: 'Lost' });
    const res = await request(app).get('/api/leads/stats').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ total: 3, New: 2, Contacted: 0, Qualified: 0, Lost: 1 });
  });
});

describe('Authorization and ownership', () => {
  it('returns 401 for every lead endpoint without a token', async () => {
    const id = '64b7f0c2a1b2c3d4e5f60718';
    const calls = [
      request(app).get('/api/leads'),
      request(app).post('/api/leads').send(validLead()),
      request(app).get('/api/leads/stats'),
      request(app).get(`/api/leads/${id}`),
      request(app).put(`/api/leads/${id}`).send({ name: 'Abc' }),
      request(app).delete(`/api/leads/${id}`),
    ];
    for (const res of await Promise.all(calls)) expect(res.status).toBe(401);
  });

  it('isolates users: others cannot read, update, delete, list or count my leads', async () => {
    const mine = await createLead();
    const id = mine.body.data._id;
    const { token: intruder } = await registerUser('intruder@example.com');

    expect((await request(app).get(`/api/leads/${id}`).set(auth(intruder))).status).toBe(404);
    expect((await request(app).put(`/api/leads/${id}`).set(auth(intruder)).send({ status: 'Lost' })).status).toBe(404);
    expect((await request(app).delete(`/api/leads/${id}`).set(auth(intruder))).status).toBe(404);
    expect((await request(app).get('/api/leads').set(auth(intruder))).body.data).toHaveLength(0);
    expect((await request(app).get('/api/leads/stats').set(auth(intruder))).body.data.total).toBe(0);

    // The original lead is untouched.
    const still = await request(app).get(`/api/leads/${id}`).set(auth(token));
    expect(still.status).toBe(200);
    expect(still.body.data.status).toBe('New');
  });

  it('allows two users to store a lead with the same email independently', async () => {
    await createLead();
    const { token: other } = await registerUser('second@example.com');
    expect((await createLead({}, other)).status).toBe(201);
  });
});
