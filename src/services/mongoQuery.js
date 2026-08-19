const { connectMongoDB } = require("../databases/mongodb");


async function executeMongoQuery(query) {

    const db = await connectMongoDB();

    const collection = db.collection(
        query.collection
    );

    switch (query.operation) {

        case "find":

            return await collection
                .find(query.filter || {})
                .toArray();


        case "aggregate":

            return await collection
                .aggregate(query.pipeline || [])
                .toArray();


        default:

            throw new Error(
                "Only find and aggregate operations are allowed"
            );
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
    executeMongoQuery,
    collectionExists
};

