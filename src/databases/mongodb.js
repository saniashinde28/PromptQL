const { MongoClient } = require("mongodb");

const BaseDB = require("./base");


class MongoDB extends BaseDB {

    constructor() {
        super();

        this.client = new MongoClient(
            process.env.MONGODB_URI
        );

        this.db = null;
    }


    async connect() {

        if (!this.db) {

            await this.client.connect();

            this.db = this.client.db(
                process.env.MONGODB_DB_NAME
            );
        }

        await this.db.command({
            ping: 1
        });

        return true;
    }


    async getSchema() {

        await this.connect();

        const collections = await this.db.listCollections().toArray();

        const schema = {};

        for (const collection of collections) {
            const documents = await this.db
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


    async validateQuery(query) {

        if (!query ||
            typeof query !== "object") {
            return false;
        }

        if (query.type !== "mongo") {
            return false;
        }

        if (!query.collection ||
            typeof query.collection !== "string") {
            return false;
        }

        if (
            query.operation !== "find" &&
            query.operation !== "aggregate"
        ) {
            return false;
        }


        if (query.operation === "find") {

            if (
                query.filter !== undefined &&
                (
                    typeof query.filter !== "object" ||
                    Array.isArray(query.filter)
                )
            ) {
                return false;
            }
        }


        if (query.operation === "aggregate") {

            if (!Array.isArray(query.pipeline)) {
                return false;
            }
        }


        return true;
    }


    async executeQuery(query) {

        await this.connect();

        const isValid =
            await this.validateQuery(query);

        if (!isValid) {
            throw new Error(
                "Invalid or non-read-only MongoDB query"
            );
        }


        const collection =
            this.db.collection(
                query.collection
            );


        const exists =
            await this.collectionExists(
                query.collection
            );

        if (!exists) {
            throw new Error(
                `Collection '${query.collection}' does not exist`
            );
        }

        if (query.operation === "find") {

            const data =
                await collection
                    .find(query.filter || {})
                    .toArray();


            return {
                data,
                rowCount: data.length
            };
        }


        if (query.operation === "aggregate") {

            const data =
                await collection
                    .aggregate(
                        query.pipeline || []
                    )
                    .toArray();


            return {
                data,
                rowCount: data.length
            };
        }
    }

    async collectionExists(collectionName) {

        const collections =
            await this.db
                .listCollections()
                .toArray();

        return collections.some(
            collection =>
                collection.name === collectionName
        );
    }


    async close() {
        await this.client.close();
    }
}


module.exports = MongoDB;