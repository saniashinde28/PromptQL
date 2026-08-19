const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(
    process.env.HF_TOKEN
);

const MODEL = "Qwen/Qwen2.5-7B-Instruct";


function buildPrompt(userQuery, databaseType, schema) {

    return `
You are the query generation engine for PromptQL.

PromptQL is a READ-ONLY natural language database query system.

Database type:
${databaseType}

Database schema:
${JSON.stringify(schema, null, 2)}

User request:
${userQuery}

Rules:

1. Generate ONLY read-only queries.
2. Never generate INSERT, UPDATE, DELETE, DROP, ALTER,
   CREATE, TRUNCATE, or any other write operation.
3. Use only tables, collections, and fields present in the schema.
4. Do not invent table names, collection names, or fields.
5. Return ONLY valid JSON.
6. Do not return markdown.
7. Do not provide explanations.

IMPORTANT SCHEMA RULES:

1. You MUST use only tables, collections, fields, and columns
   that exist in the provided schema.

2. NEVER invent, assume, or hallucinate a field, column,
   table, or collection.

3. Before generating the query, check whether every field
   required to answer the user's request exists in the schema.

4. If any required field does not exist, DO NOT generate a query.

5. Instead return:
{
  "type": "error",
  "message": "The requested fields are not available in the provided schema."
}

6. The schema is the source of truth.

If the database is PostgreSQL, MySQL, or SQLite,
return exactly:

{
    "type": "sql",
    "query": "SELECT ..."
}

If the database is MongoDB and the request is a simple
document lookup, return exactly:

{
    "type": "mongo",
    "operation": "find",
    "collection": "collection_name",
    "filter": {}
}

If the database is MongoDB and the request requires
aggregation, return exactly:

{
    "type": "mongo",
    "operation": "aggregate",
    "collection": "collection_name",
    "pipeline": []
}
`;
}


async function generateQuery(userQuery, databaseType, schema) {

    const prompt = buildPrompt(
        userQuery,
        databaseType,
        schema
    );

    try {

        const response = await client.chatCompletion({
            model: MODEL,

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            max_tokens: 512,
            temperature: 0.1
        });

        const content =
            response.choices[0].message.content.trim();

        console.log("AI response:", content);

        return JSON.parse(content);

    } catch (error) {

        console.error(
            "AI query generation failed:",
            error.message
        );

        throw new Error(
            "Failed to generate database query"
        );
    }
}


module.exports = {
    generateQuery
};