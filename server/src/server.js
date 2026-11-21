import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';

const { PORT = 5000, MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Missing required environment variables: MONGODB_URI and JWT_SECRET');
  process.exit(1);
}

try {
  await connectDatabase(MONGODB_URI);
  createApp().listen(PORT, () => console.log(`LeadFlow API listening on port ${PORT}`));
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
