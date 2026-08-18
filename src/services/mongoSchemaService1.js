const { connectMongoDB } = require("../databases/mongodb");

async function getMongoDatabaseSchema() {
    const db = await connectMongoDB();

    const collections = await db.listCollections().toArray();

    const schema = {};

    for (const collection of collections) {
        const documents = await db
            .collection(collection.name)
            .find({})
            .limit(5)
            .toArray();

        const fields = new Set();

        documents.forEach((document) => {
            Object.keys(document).forEach((field) => {
                fields.add(field);
            });
        });

        schema[collection.name] = {
            fields: [...fields],
            sampleDocuments: documents
        };
    }

    return schema;
}

module.exports = {
    getMongoDatabaseSchema
};