const PostgresDB = require("./postgres");
const MongoDB = require("./mongodb");
const MySQLDB = require("./mysql");
const SQLiteDB = require("./sqlite");


function getDatabaseAdapter(databaseType) {

    switch (databaseType) {

        case "postgres":
        case "postgresql":
            return new PostgresDB();


        case "mongodb":
            return new MongoDB();


        case "mysql":
            return new MySQLDB();


        case "sqlite":
            return new SQLiteDB();


        default:

            throw new Error(
                `Unsupported database type: ${databaseType}`
            );
    }
}


module.exports = {
    getDatabaseAdapter
};