import mongoose from 'mongoose';
import 'dotenv/config'; // Make sure this is at the top of this file too if it's used directly
import { logger } from '../utils/logger'; // Assuming you have a logger here

const mongoUri: string = process.env.MONGO_URI || ""; // Ensure it's a string

// Add an interface for the Mongoose connection object for better type safety
interface MongooseConnection extends mongoose.Connection {}

let _mongooseConnection: MongooseConnection | null = null; // Store the connection instance

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
        // Mongoose handles pooling internally
        await mongoose.connect(mongoUri);
        _mongooseConnection = mongoose.connection; // Store the active connection
        logger.info('MongoDB connected successfully.');
    } catch (error) {
        logger.error('MongoDB connection error. Check MONGO_URI:', error as any);
        // It's usually fine to let the server start, as Mongo is for secondary data (logs/analytics)
        // Re-throw or exit if MongoDB is critical for your app's startup
        throw error; // Changed to throw, as it's better to explicitly handle this upstream
    }
};

/**
 * Returns the active Mongoose connection instance.
 * @returns {MongooseConnection} The Mongoose connection object.
 * @throws {Error} If the MongoDB connection has not been established.
 */
export const getMongooseConnection = (): MongooseConnection => {
    if (!_mongooseConnection || _mongooseConnection.readyState !== 1) {
        throw new Error('MongoDB connection is not established. Call connectMongoDB() first.');
    }
    return _mongooseConnection;
};