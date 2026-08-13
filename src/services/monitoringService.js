const client=require("prom-client");

//collect default nodejs metrics
client.collectDefaultMetrics();

const QUERY_COUNTER=new client.Counter({
    name:"NL_query",
    help:"total number of queries processed",
    labelNames:["source","status"]
});

const QUERY_DURATION=new client.Histogram({
    name:"NL_query_duration",
    help:"query processing duration in seconds",
    labelNames:["source"]
});

const LLM_REQUESTS = new client.Counter({
    name: "NL_llm_requests_total",
    help: "Total number of LLM requests",
    labelNames: ["model", "status"]
});

const DB_CONNECTION_GAUGE = new client.Gauge({
    name: "NL_db_connections",
    help: "Number of active database connections",
    labelNames: ["source"]
});

module.exports = {
    client,
    QUERY_COUNTER,
    QUERY_DURATION,
    LLM_REQUESTS,
    DB_CONNECTION_GAUGE
};