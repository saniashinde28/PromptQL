require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT;
const {connectMongoDB}=require("./databases/mongodb");

async function startServer() {
    try {
        if (process.env.DB_TYPE === "mongodb") {
            await connectMongoDB();
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();