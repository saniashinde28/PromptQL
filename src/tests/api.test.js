const request = require("supertest");
const app = require("../app");

describe("Health API", () => {

    test("should return 200", async () => {

        const response = await request(app)
            .get("/health");

        expect(response.statusCode).toBe(200);
    });

});

describe("Query API", () => {

    test("should return 400 when query is missing", async () => {
        const response = await request(app)
            .post("/api/query")
            .set("X-API-Key", process.env.API_KEY)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Query is required");
    });

});

//test API-key authentication
test("should reject request without API key", async () => {
    const response = await request(app)
        .post("/api/query")
        .send({
            query: "SELECT * FROM users"
        });

    expect(response.statusCode).toBe(401);
});

//wrong API key
test("should reject request with invalid API key", async () => {
    const response = await request(app)
        .post("/api/query")
        .set("X-API-Key", "wrong-key")
        .send({
            query: "SELECT * FROM users"
        });

    expect(response.statusCode).toBe(401);
});