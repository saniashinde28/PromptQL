require("dotenv").config();

console.log(
    "SQLite path loaded:",
    process.env.SQLITE_DB_PATH
);

console.log(
    "MongoDB URI loaded:",
    !!process.env.MONGODB_URI
);