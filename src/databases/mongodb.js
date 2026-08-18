const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);

let db;
async function connectMongoDB() {
    if(!db){
        await client.connect();

        db = client.db(process.env.MONGODB_DB_NAME);

        console.log(`MongoDB connected to database: ${process.env.MONGO_DB_NAME}`);

        return db;
    } 
    return db;
}


module.exports = {
    connectMongoDB
};