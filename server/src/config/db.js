import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerfit';

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('MongoDB disconnected.');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
  } catch (error) {
    isConnected = false;
    console.warn(`MongoDB not immediately available (${error.message}). Server running in degraded mode.`);
  }
};

export const getDbStatus = () => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    state: readyStates[mongoose.connection.readyState] || 'unknown',
    database: mongoose.connection.name || null,
  };
};
