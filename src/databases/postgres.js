const { Pool } = require("pg");
const BaseDB = require("./base");

class PostgresDB extends BaseDB {

    constructor() {
        super();

        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }


    async connect() {

        const client = await this.pool.connect();

        client.release();

        return true;
    }


    async getSchema() {

        const result = await this.pool.query(`Select 
            table_name,
            column_name,
            data_type
            FROM information_schema.columns
            WHERE table_schema='public'
            ORDER BY table_name, ordinal_position;`);

        const schema = {};
        result.rows.forEach(row => {
            if (!schema[row.table_name]) {
                schema[row.table_name] = {};
            }

            schema[row.table_name][row.column_name] = row.data_type;
        });
        return schema;

    }


    async validateQuery(query) {

        const normalized = query
            .trim()
            .toUpperCase();

        if (!normalized.startsWith("SELECT")) {
            return false;
        }

        try {

            await this.pool.query(
                `EXPLAIN ${query}`
            );

            return true;

        } catch (error) {

            console.error(
                "PostgreSQL query validation failed:",
                error.message
            );

            return false;
        }
    }


    async executeQuery(query) {

        const isValid = await this.validateQuery(query);

        if (!isValid) {
            throw new Error(
                "Invalid or non-read-only PostgreSQL query"
            );
        }

        const result = await this.pool.query(query);

        return {
            data: result.rows,
            rowCount: result.rowCount
        };
    }


    async close() {
        await this.pool.end();
    }
}


module.exports = PostgresDB;