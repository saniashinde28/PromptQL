const express = require('express');
const pool = require('./db');
const { getDatabaseSchema } = require("./services/schemaService");
const { generateSQL } = require("./services/aiService");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

app.get("/health", (req, res) => {
    res.send("Working!");
});
//get schema
app.get("/api/schema", async (req, res) => {
    try {
        const schema = await getDatabaseSchema();
        res.send(schema);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "failed to fetch db schema"
        });
    }
});

//generate SQL
app.post("/api/generateSql",async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                error: "Query is required!"
            });
        }

        const schema = await getDatabaseSchema();

        const sql = await generateSQL(query, schema);

        res.json({ query, sql });
    }
    catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to generate SQL"
        });
    }
})

//get queried data 
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query("Select * from users where city='Mumbai'");
        console.log(result.rows);
        res.send(result.rows);
    }
    catch (err) {
        console.log(err);

    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port , ${PORT}`);
});

