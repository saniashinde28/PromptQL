const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "PromptQL API",
            version: "1.0.0",
            description:
                "Natural Language Query Gateway that converts natural language requests into SQL using Claude and executes validated queries against PostgreSQL."
        },

        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "X-API-Key"
                }
            },

            schemas: {
                QueryRequest: {
                    type: "object",
                    required: ["query"],
                    properties: {
                        query: {
                            type: "string",
                            description: "Natural language query",
                            example: "Show me all users older than 25"
                        }
                    }
                },

                QueryResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        query: {
                            type: "string",
                            example: "Show me all users older than 25"
                        },
                        sql: {
                            type: "string",
                            example: "SELECT * FROM users WHERE age > 25"
                        },
                        data: {
                            type: "array",
                            items: {
                                type: "object"
                            }
                        },
                        rowCount: {
                            type: "integer",
                            example: 2
                        }
                    }
                }
            }
        }
    },

    apis: ["./src/app.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;