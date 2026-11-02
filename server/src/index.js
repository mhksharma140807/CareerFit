import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, getDbStatus } from './config/db.js';
import { seedSampleJobs } from './utils/seedJobs.js';
import { seedSampleAssessments } from './utils/seedAssessments.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  // Connect to database
  await connectDB();

  // If connected, ensure sample jobs and assessments exist without duplicate insertion
  if (getDbStatus().connected) {
    await seedSampleJobs();
    await seedSampleAssessments();
  }

  app.listen(PORT, HOST, () => {
    console.log(`CareerFit API server running on port ${PORT} (${HOST}) [${process.env.NODE_ENV || 'development'}]`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
