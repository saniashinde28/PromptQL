const PostgresDB =
    require("../databases/postgres");

const MySQLDB =
    require("../databases/mysql");

const SQLiteDB =
    require("../databases/sqlite");

const MongoDB =
    require("../databases/mongodb");


describe("Database adapter validation", () => {

    test("PostgreSQL rejects INSERT", async () => {

        const adapter =
            new PostgresDB();


        const valid =
            await adapter.validateQuery({
                type: "sql",
                query:
                    "INSERT INTO users VALUES (1)"
            });


        expect(valid).toBe(false);

        await adapter.close();
    });


    // test("MySQL rejects DELETE", async () => {

    //     const adapter =
    //         new MySQLDB();


    //     const valid =
    //         await adapter.validateQuery({
    //             type: "sql",
    //             query:
    //                 "DELETE FROM users"
    //         });


    //     expect(valid).toBe(false);

    //     await adapter.close();
    // });


    test("SQLite rejects UPDATE", async () => {

        const adapter =
            new SQLiteDB();


        const valid =
            await adapter.validateQuery({
                type: "sql",
                query:
                    "UPDATE users SET age = 30"
            });


        expect(valid).toBe(false);

        await adapter.close();
    });


    test("MongoDB rejects write operations", async () => {

        const adapter =
            new MongoDB();


        expect(
            await adapter.validateQuery({
                type: "mongo",
                operation: "insertOne",
                collection: "users",
                document: {}
            })
        ).toBe(false);
    });


    test("MongoDB rejects $out", async () => {

        const adapter =
            new MongoDB();


        expect(
            await adapter.validateQuery({
                type: "mongo",
                operation: "aggregate",
                collection: "users",
                pipeline: [
                    {
                        $out: "backup"
                    }
                ]
            })
        ).toBe(false);
    });

});