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

//generate SQL
app.post("/api/query",async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                error: "Query is required!"
            });
        }

        const schema = await getDatabaseSchema();

        const sql = await generateSQL(query, schema);

        const result=await pool.query(sql);

        res.json({success:true,
            query,
            sql,
            data:result.rows,
            rowCount:result.rowCount
        });
    }
    catch (err) {
        console.error(err);

        res.status(500).json({
            success:false,
            error: "Failed to execute query"
        });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port , ${PORT}`);
});

