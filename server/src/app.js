import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import leadRoutes from './routes/lead.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();
  const isTest = process.env.NODE_ENV === 'test';

  app.set('trust proxy', 1); // behind Render's proxy
  app.use(helmet());

  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  app.use(
    cors({
      // Allow non-browser clients (no Origin header) and the configured client origins only.
      origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    }),
  );

  app.use(express.json({ limit: '10kb' }));

  const limiter = (max) =>
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => isTest,
      message: { success: false, message: 'Too many requests. Please try again later.' },
    });

  app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
  app.use('/api/auth', limiter(30), authRoutes);
  app.use('/api/leads', limiter(600), leadRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
