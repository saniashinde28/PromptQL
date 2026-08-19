const sqlite3 = require("sqlite3");
const BaseDB = require("./base");


class SQLiteDB extends BaseDB {

    constructor() {

        super();

        this.db = new sqlite3.Database(
            process.env.SQLITE_PATH
        );
    }


    connect() {

        return new Promise(
            (resolve, reject) => {

                this.db.get(
                    "SELECT 1",
                    (error) => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve(true);
                        }
                    }
                );
            }
        );
    }


    getSchema() {

        return new Promise(
            async (resolve, reject) => {

                try {

                    const tables =
                        await this.all(`
                            SELECT name
                            FROM sqlite_master
                            WHERE type = 'table'
                            AND name NOT LIKE 'sqlite_%'
                        `);


                    const schema = {};


                    for (const table of tables) {

                        const columns =
                            await this.all(`
                                PRAGMA table_info(
                                    "${table.name}"
                                )
                            `);


                        schema[table.name] = {
                            columns: columns.map(
                                column => ({
                                    name: column.name,
                                    type: column.type
                                })
                            )
                        };
                    }


                    resolve(schema);

                } catch (error) {

                    reject(error);
                }
            }
        );
    }


    validateQuery(query) {

        const normalized =
            query.trim().toUpperCase();

        return Promise.resolve(
            normalized.startsWith("SELECT")
        );
    }


    executeQuery(query) {

        return new Promise(
            (resolve, reject) => {

                this.db.all(
                    query,
                    [],
                    (error, rows) => {

                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve({
                            data: rows,
                            rowCount: rows.length
                        });
                    }
                );
            }
        );
    }


    all(sql, params = []) {

        return new Promise(
            (resolve, reject) => {

                this.db.all(
                    sql,
                    params,
                    (error, rows) => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve(rows);
                        }
                    }
                );
            }
        );
    }


    close() {

        return new Promise(
            (resolve, reject) => {

                this.db.close(
                    error => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    }
                );
            }
        );
    }
}


module.exports = SQLiteDB;