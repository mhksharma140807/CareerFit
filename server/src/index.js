import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  app.listen(PORT, () => {
    console.log(`CareerFit API server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
