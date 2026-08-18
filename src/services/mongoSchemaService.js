const {connectMongoDB} = require("../databases/mongodb");

async function getMongoSchema(){
    const db=await connectMongoDB();

    const collections = await db.collections().toArray();

    const schema={};

    for(const collection of collections){
        const documents=await db
        .collection(collection.name)
        .find({})
        .limit(5)
        .toArray();

        schema[collection.name]=documents;
    }
    return schema;
}

module.exports={getMongoSchema}