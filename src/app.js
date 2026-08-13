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
    QUERY_DURATION, updateDBConnections } = require("./services/monitoringService");
const { client } = require("./services/monitoringService");
const AppError = require("./utils/AppError");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

app.use("/docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec));


/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     description: Returns the current health status of the PromptQL API.
 *     responses:
 *       200:
 *         description: API is running successfully
 */
app.get("/health", (req, res) => {
    res.send("Working!");
});


/**
 * @swagger
 * /api/query:
 *   post:
 *     summary: Execute a natural language database query
 *     description: >
 *       Accepts a natural language query, uses Claude to generate SQL
 *       based on the database schema, validates the generated SQL,
 *       and executes it against the configured PostgreSQL database.
 *
 *     security:
 *       - ApiKeyAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QueryRequest'
 *
 *     responses:
 *       200:
 *         description: Query generated, validated, and executed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueryResponse'
 *
 *       400:
 *         description: Invalid request or generated SQL query.
 *
 *       401:
 *         description: Missing or invalid API key.
 *
 *       429:
 *         description: Rate limit exceeded.
 *
 *       500:
 *         description: Internal server error.
 */
app.post("/api/query", authenticateAPIkey, queryLimiter, async (req, res, next) => {
    try {
        const { query } = req.body;

        if (!query) {
            throw new AppError(
                "Query is required",
                400,
                "MISSING_QUERY"
            );
        }
        //step 1: intrpspect db
        const schema = await getDatabaseSchema();
        const sql = query;
        //step 2: send NL to claude
        // const sql = await generateSQL(query, schema);

        //step 3: valid generated SQL
        const isValid = validateSqlQuery(sql);

        if (!isValid) {
            throw new AppError(
                "Generated SQL query is invalid",
                400,
                "INVALID_SQL"
            );
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


/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get application metrics
 *     description: Returns Prometheus monitoring metrics for PromptQL.
 *     responses:
 *       200:
 *         description: Prometheus metrics
 */
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());

});

app.use(errorHandler);

module.exports=app;