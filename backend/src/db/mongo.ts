import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri: string | undefined = process.env.MONGO_URI || "";

export const connectMongoDB = async () => {
    if (!mongoUri) {
        console.warn('MongoDB URI is missing. Skipping MongoDB connection.');
        return; // Allows the server to start even without Mongo for initial setup
    }
    
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection error. Check MONGO_URI:', error);
        // It's usually fine to let the server start, as Mongo is for secondary data (logs/analytics)
    }
};