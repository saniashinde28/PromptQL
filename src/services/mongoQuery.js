const { connectMongoDB } = require("../databases/mongodb");

async function executeMongoQuery(query) {

    const db = await connectMongoDB();

    const collection = db.collection(query.collection);

    switch (query.operation) {

        case "find":
            return await collection
                .find(query.filter || {})
                .toArray();

        case "insertOne":
            return await collection.insertOne(
                query.document
            );

        case "updateMany":
            return await collection.updateMany(
                query.filter || {},
                query.update
            );

        case "deleteMany":
            return await collection.deleteMany(
                query.filter || {}
            );

        default:
            throw new Error("Unsupported MongoDB operation");
    }
}

async function collectionExists(collectionName) {

    const db = await connectMongoDB();

    const collections = await db
        .listCollections()
        .toArray();

    return collections.some(
        collection => collection.name === collectionName
    );
}

module.exports = {
    executeMongoQuery,collectionExists
};