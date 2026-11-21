import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test_secret_that_is_long_enough_for_hs256',
      CLIENT_URL: 'http://localhost:5173',
    },
    // The first run downloads a MongoDB binary for mongodb-memory-server.
    hookTimeout: 180000,
    testTimeout: 30000,
    fileParallelism: false,
  },
});
