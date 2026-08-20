require("dotenv").config();

const app =
    require("./app");

const {
    getDatabaseAdapter
} = require("./databases/databaseFactory");


const PORT =
    process.env.PORT || 5000;


const server =
    app.listen(
        PORT,
        () => {

            console.log(
                `PromptQL server running on port ${PORT}`
            );
        }
    );


async function shutdown() {

    console.log(
        "Shutting down PromptQL..."
    );


    server.close(
        async () => {

            try {

                const databaseType =
                    process.env.DB_TYPE;


                if (databaseType) {

                    const adapter =
                        getDatabaseAdapter(
                            databaseType
                        );


                    await adapter.close();
                }


                console.log(
                    "PromptQL shutdown complete"
                );


                process.exit(0);

            } catch (error) {

                console.error(
                    "Shutdown error:",
                    error
                );


                process.exit(1);
            }
        }
    );
}


process.on(
    "SIGTERM",
    shutdown
);


process.on(
    "SIGINT",
    shutdown
);