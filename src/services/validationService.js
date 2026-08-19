const pool = require("../db");

async function validateSqlQuery(query) {

    const normalized = query
        .trim()
        .toUpperCase();

    if (!normalized.startsWith("SELECT")) {

        console.error(
            "Only SELECT queries are allowed"
        );

        return false;
    }

    try {

        await pool.query(
            `EXPLAIN ${query}`
        );

        return true;

    } catch (error) {

        console.error(
            "SQL validation failed",
            error.message
        );

        return false;
    }
}

function validateMongoQuery(query) {

    if (!query || typeof query !== "object") {
        return false;
    }

    if (!query.type || query.type !== "mongo") {
        return false;
    }

    if (!query.operation ||
        typeof query.operation !== "string") {
        return false;
    }

    if (!["find", "aggregate"].includes(query.operation)) {
        return false;
    }

    if (!query.collection ||
        typeof query.collection !== "string") {
        return false;
    }

    if (query.operation === "find") {

        if (
            query.filter !== undefined &&
            typeof query.filter !== "object"
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

module.exports = {validateSqlQuery,validateMongoQuery};