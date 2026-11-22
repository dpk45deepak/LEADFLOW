import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

const app = createApp();
let connectionPromise;

async function ensureDatabaseConnection() {
  const { MONGODB_URI, JWT_SECRET } = process.env;
  if (!MONGODB_URI || !JWT_SECRET) {
    throw new Error('Missing required environment variables: MONGODB_URI and JWT_SECRET');
  }

  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = connectDatabase(MONGODB_URI).finally(() => {
      connectionPromise = undefined;
    });
  }

  await connectionPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDatabaseConnection();
    app(req, res);
  } catch (error) {
    console.error('Failed to initialize API request:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
