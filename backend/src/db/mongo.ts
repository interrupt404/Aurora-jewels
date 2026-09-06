import mongoose from 'mongoose';
import 'dotenv/config';
import { logger } from '../utils/logger';

const mongoUri: string = process.env.MONGO_URI || "";

let _mongooseConnection: mongoose.Connection | null = null;

export const connectMongoDB = async (): Promise<void> => {
    if (!mongoUri) {
        logger.warn('MongoDB URI is missing. Skipping MongoDB connection.');
        return;
    }
    
    // If connection already exists, just return
    if (_mongooseConnection && _mongooseConnection.readyState === 1) {
        logger.info('MongoDB connection already established.');
        return;
    }

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        _mongooseConnection = mongoose.connection;
        logger.info('MongoDB connected successfully.');
    } catch (error: any) {
        logger.warn('⚠️ MongoDB connection failed. Skipping MongoDB step to allow server deployment:', error.message || error);
        _mongooseConnection = null;
    }
};

/**
 * Returns the active Mongoose connection instance or null if unavailable.
 */
export const getMongooseConnection = (): mongoose.Connection | null => {
    if (!_mongooseConnection || _mongooseConnection.readyState !== 1) {
        return null;
    }
    return _mongooseConnection;
};