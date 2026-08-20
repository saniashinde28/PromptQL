require('dotenv').config();
const express = require('express');
const { generateQuery } = require("./services/aiService");
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
const {getDatabaseAdapter} = require("./databases/databaseFactory");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


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
app.post("/api/query",authenticateAPIkey,queryLimiter,async (req, res, next) => {

        let adapter;
        let databaseType;

        try {

            const {query,source} = req.body;

            //validate request

            if (!query) {

                throw new AppError(
                    "Query is required",
                    400,
                    "MISSING_QUERY"
                );
            }


            if (!source) {

                throw new AppError(
                    "Database source is required",
                    400,
                    "MISSING_SOURCE"
                );
            }

            //DB adapter

            databaseType = source;

            adapter =
                getDatabaseAdapter(
                    databaseType
                );


            //connect to the DB

            await adapter.connect();


            //get the DB schema

            const schema =
                await adapter.getSchema();


            //Generate the Query

            const generatedQuery =
                await generateQuery(
                    query,
                    databaseType,
                    schema
                );


            //validate query

            const isValid =
                await adapter.validateQuery(
                    generatedQuery
                );


            if (!isValid) {

                throw new AppError(
                    "Generated query is invalid",
                    400,
                    "INVALID_QUERY"
                );
            }

            const safeQuery=applyQueryLimit(generatedQuery);


            //execute query

            const startTime =
                process.hrtime();


            const result =
                await adapter.executeQuery(
                    safeQuery
                );


            //duration

            const [
                seconds,
                nanoseconds
            ] = process.hrtime(startTime);


            const duration =
                seconds +
                nanoseconds / 1e9;


            //metrics 

            QUERY_DURATION
                .labels(databaseType)
                .observe(duration);


            QUERY_COUNTER
                .labels(
                    databaseType,
                    "success"
                )
                .inc();


            return res.json({

                success: true,

                query,

                safeQuery,

                data: result.data,

                rowCount: result.rowCount
            });

        }

        catch (error) {

            QUERY_COUNTER
                .labels(
                    databaseType || "unknown",
                    "error"
                )
                .inc();

            console.error(error);

            next(error);
        }
    }
);


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

module.exports = app;