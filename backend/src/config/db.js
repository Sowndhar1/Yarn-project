import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://YarnBusiness:yarnbusiness@cluster0.b5a3ef6.mongodb.net/yarn-business?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || 'yarn-business';

let client;
let db;

export const connectDB = async () => {
    try {
        if (db) {
            console.log('✅ Already connected to MongoDB');
            return db;
        }

        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);

        console.log(`✅ Successfully connected to MongoDB Atlas - Database: ${DB_NAME}`);
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

export const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};

export const closeDB = async () => {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
};
