const { ChatAnthropic } = require("@langchain/anthropic");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { LLM_REQUESTS } = require("./monitoringService");

const model = new ChatAnthropic({
    model: "claude-sonnet-4-6",
    temperature: 0,
    apikey: process.env.ANTHROPIC_API_KEY
});

const sqlPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a PostgreSQL SQL query generator.

You will receive a database schema and a user's natural language request.

Convert the user's request into a valid PostgreSQL SELECT query.

Rules:
- Generate only appropriate queries, do not give any explanations along with it
- make sure the query syntax is correct
- Use only tables and columns present in the provided schema.
- Return only the SQL query without any comments.`
    ],
    [
        "human",
        `Database schema:

{schema}

User request:

{query}`
    ]
]);

const sqlChain = sqlPrompt.pipe(model);
function cleanSQL(sql) {
    return sql
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .trim();
}
async function generateSQL(query, schema) {
    try {
        const response = await chain.invoke({
            schema: JSON.stringify(schema, null, 2),
            query: query
        });
        LLM_REQUESTS
            .labels("claude", "success")
            .inc();
        return cleanSQL(response.content.toString().trim());
    } catch (err) {
        LLM_REQUESTS
            .labels("claude", "error")
            .inc();

        throw err;
    }
}

const mongoPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a MongoDB query generator.

You will receive a MongoDB database schema and a user's natural language request.

Convert the user's request into a MongoDB find query.

Rules:
- Generate only syntactically valid operations
- Use only collections and fields present in the provided schema.
- Return ONLY valid JSON.
- Do not return JavaScript.
- Do not return markdown.
- Do not explain anything.

The JSON must follow this format:

{{
    "operation": "find",
    "collection": "users",
    "filter": {{}},
    "projection": {{}},
    "sort": {{}},
    "limit": 0
    }}

Use:
- "filter" for filtering documents.
- "projection" for selecting fields.
- "sort" for sorting results.
- "limit" for limiting results.
`
    ],
    [
        "human",
        `Database schema:

{schema}

User request:

{query}`
    ]
]);

const mongoChain = mongoPrompt.pipe(model);
function cleanMongoJSON(response) {
    return response
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
}
async function generateMongoQuery(query, schema) {
    try {
        const response = await mongoChain.invoke({
            schema: JSON.stringify(schema, null, 2),
            query: query
        });

        LLM_REQUESTS
            .labels("claude", "success")
            .inc();

        const cleanedResponse = cleanMongoJSON(
            response.content.toString()
        );

        return JSON.parse(cleanedResponse);

    } catch (err) {

        LLM_REQUESTS
            .labels("claude", "error")
            .inc();

        throw err;
    }
}


module.exports = { generateSQL, generateMongoQuery };