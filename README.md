# PromptQL — Natural Language Query Gateway

PromptQL is a Node.js and Express-based natural language query gateway that converts  requests into  SQL/NoSQL queries using Hugging Face's Qwen2.5-7B-Instruct model. It uses structured prompt templates for schema-aware query generation and a database adapter architecture to support PostgreSQL, MySQL, SQLite, and MongoDB through a common query pipeline.

## Features

- Natural language to SQL/MongoDB query generation
- PostgreSQL, MySQL, SQLite, and MongoDB support
- Automatic database schema introspection
- Schema-aware query generation
- Structured prompt templates
- Database adapter architecture
- API key authentication
- Rate limiting
- Helmet security headers
- Prometheus monitoring
- Swagger/OpenAPI documentation

## Tech Stack

- Node.js
- Express.js
- Hugging Face Inference API
- Qwen2.5-7B-Instruct
- PostgreSQL
- MySQL
- SQLite
- MongoDB
- Prometheus
- Swagger/OpenAPI
- Jest

## Project Structure

```text
PromptQL/
├── databases/
│   ├── base.js
│   ├── databaseFactory.js
│   ├── postgres.js
│   ├── mysql.js
│   ├── sqlite.js
│   └── mongodb.js
├── services/
│   ├── aiService.js
│   └── monitoringService.js
├── middleware/
│   ├── auth.js
│   ├── rateLimiter.js
│   └── errorHandler.js
├── config/
│   └── swagger.js
├── utils/
│   └── AppError.js
├── app.js
├── server.js
├── package.json
└── README.md
```

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd PromptQL
```

### Install dependencies

```bash
npm install
```

### Create a `.env` file

```env
PORT=5000

HF_TOKEN=your_huggingface_token

API_KEY=your_api_key

MAX_QUERY_RESULTS=100

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_NAME=promptql

# MySQL
MYSQL_URI=mysql://username:password@localhost:3306/promptql

# SQLite
SQLITE_PATH=./data/promptql.db

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=promptql
```

Configure only the database you intend to use.

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The API runs on:

```text
http://localhost:5000
```

## API Endpoints

### Health Check

```http
GET /health
```

### Natural Language Query

```http
POST /api/query
```

Headers:

```http
x-api-key: YOUR_API_KEY
Content-Type: application/json
```

Request:

```json
{
  "query": "Show all users older than 25",
  "source": "postgres"
}
```

Supported sources:

```text
postgres
mysql
sqlite
mongodb
```

### Metrics

```http
GET /metrics
```

Returns Prometheus-compatible application metrics.

### Swagger Documentation

```http
GET /docs
```

Open:

```text
http://localhost:5000/docs
```

## Examples

### PostgreSQL

Request:

```json
{
  "query": "Show employees older than 25",
  "source": "postgres"
}
```

Generated query:

```json
{
  "type": "sql",
  "query": "SELECT * FROM employees WHERE age > 25"
}
```

### MongoDB

Request:

```json
{
  "query": "Find users older than 25",
  "source": "mongodb"
}
```

Generated query:

```json
{
  "type": "mongo",
  "operation": "find",
  "collection": "users",
  "filter": {
    "age": {
      "$gt": 25
    }
  }
}
```

## Security

PromptQL includes:

- API key authentication
- Rate limiting
- Helmet security headers
- CORS configuration
- Read-only query validation
- Schema-based query validation
- Query result limits

## Monitoring

Prometheus metrics are exposed through:

```http
GET /metrics
```

The application tracks:

- Query count
- Query duration
- Database-specific metrics
- LLM requests

## Query Flow

```text
Natural Language Request
        ↓
Database Adapter
        ↓
Schema Introspection
        ↓
Prompt Template
        ↓
Qwen2.5-7B-Instruct
        ↓
Generated Query
        ↓
Adapter Validation
        ↓
Query Execution
        ↓
Response
```

## Testing

Run tests with:

```bash
npm test
```
