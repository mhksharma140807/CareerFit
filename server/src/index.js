import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, getDbStatus } from './config/db.js';
import { seedSampleJobs } from './utils/seedJobs.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  // If connected, ensure sample jobs exist without duplicate insertion
  if (getDbStatus().connected) {
    await seedSampleJobs();
  }

  app.listen(PORT, () => {
    console.log(`CareerFit API server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
