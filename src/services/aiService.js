const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});


async function generateSQL(userQuery, schema) {

    const prompt = `
You are a PostgreSQL SQL query generator.

You will receive a database schema and a user's natural language request.

Your job is to convert the user's request into a valid PostgreSQL SELECT query.

Database schema:
${JSON.stringify(schema, null, 2)}

User request:
${userQuery}

Rules:
- Generate only SELECT queries.
- Do not generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE or CREATE queries.
- Use only tables and columns present in the provided schema.
- Return only the SQL query.
`;

    const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 500,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });

    return response.content[0].text.trim();
}

module.exports = {
    generateSQL
};