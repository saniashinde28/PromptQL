const { ChatAnthropic } = require("@langchain/anthropic");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { LLM_Requests } = require("./monitoringService");

const model = new ChatAnthropic({
    model: "claude-sonnet-4-6",
    temperature: 0,
    apikey: process.env.ANTHROPIC_API_KEY
});

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a PostgreSQL SQL query generator.

You will receive a database schema and a user's natural language request.

Convert the user's request into a valid PostgreSQL SELECT query.

Rules:
- Generate only SELECT queries.
- Do not generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE or CREATE.
- Use only tables and columns present in the provided schema.
- Return only the SQL query.`
    ],
    [
        "human",
        `Database schema:

{schema}

User request:

{query}`
    ]
]);

const chain = prompt.pipe(model);
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

module.exports = { generateSQL };