const express = require('express');
const pool = require('./db');
const { getDatabaseSchema } = require("./services/schemaService");
const { generateSQL } = require("./services/aiService");
const {validateSqlQuery}=require("./services/validationService");
const {errorHandler}=require("./middleware/errorHandler");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

app.get("/health", (req, res) => {
    res.send("Working!");
});

//generate SQL
app.post("/api/query",async (req, res,next) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                error: "Query is required!"
            });
        }
        //step 1: intrpspect db
        const schema = await getDatabaseSchema();
        const sql=query;
        //step 2: send NL to claude
        // const sql = await generateSQL(query, schema);
        
        //step 3: valid generated SQL
        const isValid=validateSqlQuery(sql);

        if(!isValid){
            return res.status(400).json({
                success:false,
                error:"Generated Sql query is invalid"
            });
        }
        
        //step 4 : execute the query
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
        next(err);
    }
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port , ${PORT}`);
});

