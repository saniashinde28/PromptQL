const express = require('express');
const pool = require('./db');
const { getDatabaseSchema } = require("./services/schemaService");
const { generateSQL } = require("./services/aiService");
const { validateSqlQuery } = require("./services/validationService");
const { errorHandler } = require("./middleware/errorHandler");
const { authenticateAPIkey } = require("./middleware/auth");
const { queryLimiter } = require("./middleware/rateLimiter");
const helmet = require("helmet");
const morgan = require("morgan");
const { QUERY_COUNTER,
    QUERY_DURATION,updateDBConnections } = require("./services/monitoringService");
const {client}=require("./services/monitoringService"); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

app.get("/health", (req, res) => {
    res.send("Working!");
});

//generate SQL
app.post("/api/query", authenticateAPIkey, queryLimiter, async (req, res, next) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                error: "Query is required!"
            });
        }
        //step 1: intrpspect db
        const schema = await getDatabaseSchema();
        const sql = query;
        //step 2: send NL to claude
        // const sql = await generateSQL(query, schema);

        //step 3: valid generated SQL
        const isValid = validateSqlQuery(sql);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: "Generated Sql query is invalid"
            });
        }

        const startTime = process.hrtime();

        //step 4 : execute the query
        const result = await pool.query(sql);
        updateDBConnections(pool);

        const [seconds, nanoseconds] = process.hrtime(startTime);

        const duration = seconds + nanoseconds / 1e9;

        QUERY_DURATION
            .labels("postgres")
            .observe(duration);

        QUERY_COUNTER
            .labels("postgres", "success")
            .inc();

        res.json({
            success: true,
            query,
            sql,
            data: result.rows,
            rowCount: result.rowCount
        });
    }
    catch (err) {
        QUERY_COUNTER
            .labels("postgres", "error")
            .inc();
        console.error(err);
        next(err);
    }
});

app.get("/metrics",async(req,res)=>{
    res.set("Content-Type",client.register.contentType);
    res.end(await client.register.metrics());

});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port , ${PORT}`);
});

