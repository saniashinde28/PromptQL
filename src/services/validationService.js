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

module.exports = {validateSqlQuery};