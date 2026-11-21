import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app.js';

let mongod;
export const app = createApp();

/** Uses MONGODB_URI_TEST if set, otherwise an in-memory MongoDB (downloaded on first run). */
export async function connectTestDb() {
  const uri = process.env.MONGODB_URI_TEST || (mongod = await MongoMemoryServer.create()).getUri();
  await mongoose.connect(uri);
  await Promise.all(Object.values(mongoose.models).map((m) => m.init())); // build unique indexes
}

export async function disconnectTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

export async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}

export async function registerUser(email = 'sales@example.com', name = 'Sales User') {
  const res = await request(app).post('/api/auth/register').send({ name, email, password: 'password123' });
  return { token: res.body.data.token, user: res.body.data.user };
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const validLead = (overrides = {}) => ({
  name: 'Deepak Sharma',
  email: 'deepak@acme.com',
  phone: '+91 98765 43210',
  company: 'Acme Corp',
  source: 'LinkedIn',
  status: 'New',
  ...overrides,
});
