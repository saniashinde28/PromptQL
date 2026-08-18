const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
}

if (!dbName) {
    throw new Error("MONGODB_DB_NAME is not defined");
}

const client = new MongoClient(mongoUri);

let db;

async function connectMongoDB() {
    try {
        await client.connect();

        db = client.db(dbName);

        console.log(`MongoDB connected to database: ${dbName}`);

        return db;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

function getMongoDB() {
    if (!db) {
        throw new Error("MongoDB is not connected");
    }

    return db;
}
function getMongoClient() {
    return client;
}
async function closeMongoDB() {
    await client.close();
    db = null;

    console.log("MongoDB connection closed");
}

module.exports = {
    connectMongoDB,
    getMongoDB,
    closeMongoDB,
    getMongoClient
};