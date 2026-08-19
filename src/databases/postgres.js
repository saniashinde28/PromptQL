const { Pool } = require("pg");
const BaseDB = require("./base");

class PostgresDB extends BaseDB {

    constructor() {
        super();

        this.pool = new Pool({
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_NAME
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


    async validateQuery(queryPlan) {

        const normalized = queryPlan.query
            .trim()
            .toUpperCase();

        if (!normalized.startsWith("SELECT")) {
            return false;
        }

        try {

            await this.pool.query(
                `EXPLAIN ${queryPlan.query}`
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


    async executeQuery(queryPlan) {

        const isValid = await this.validateQuery(queryPlan);

        if (!isValid) {
            throw new Error(
                "Invalid or non-read-only PostgreSQL query"
            );
        }

        const result = await this.pool.query(queryPlan.query);

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