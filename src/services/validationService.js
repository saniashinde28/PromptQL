const pool = require("../db");

async function validateSqlQuery(query){
    try{
        await pool.query(`EXPLAIN ${query}`);
        return true;
    }
    catch(error){
        console.error("SQL validation failed",error.message);
        return false;
    }

}
function validateMongoQuery(query) {

    if (!query || typeof query !== "object") {
        return false;
    }

    if (!query.operation || typeof query.operation !== "string") {
        return false;
    }

    if (!query.collection || typeof query.collection !== "string") {
        return false;
    }

    return true;
}


module.exports = {validateSqlQuery,validateMongoQuery};