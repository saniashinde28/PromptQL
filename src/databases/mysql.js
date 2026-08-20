const mysql = require("mysql2/promise");
const BaseDB = require("./base");


class MySQLDB extends BaseDB {

    constructor() {
        super();

        this.pool = mysql.createPool({
            uri: process.env.MYSQL_URI
        });
    }


    async connect() {

        const connection =
            await this.pool.getConnection();

        connection.release();

        return true;
    }


    async getSchema() {

        const [rows] = await this.pool.query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);


        const schema = {};


        for (const row of rows) {

            if (!schema[row.TABLE_NAME]) {

                schema[row.TABLE_NAME] = {
                    columns: []
                };
            }


            schema[row.TABLE_NAME]
                .columns
                .push({
                    name: row.COLUMN_NAME,
                    type: row.DATA_TYPE
                });
        }


        return schema;
    }


    async validateQuery(queryPlan) {

        const normalized =
            queryPlan.query.trim().toUpperCase();


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
                "MySQL query validation failed:",
                error.message
            );

            return false;
        }
    }


    async executeQuery(queryPlan) {

        const isValid =
            await this.validateQuery(queryPlan);

        if (!isValid) {

            throw new Error(
                "Invalid or non-read-only MySQL query"
            );
        }


        const [rows] =
            await this.pool.query(queryPlan.query);


        return {
            data: rows,
            rowCount: rows.length
        };
    }


    async close() {
        await this.pool.end();
    }
}


module.exports = MySQLDB;