class BaseDB {
  async connect() {
    throw new Error("connect() must be implemented by adapter");
  }

  async getSchema() {
    throw new Error("getSchema() must be implemented by adapter");
  }

  getQueryInstructions() {
    throw new Error("getQueryInstructions() must be implemented by adapter");
  }

  async validateQuery(query) {
    throw new Error("validateQuery() must be implemented by adapter");
  }

  async executeQuery(query) {
    throw new Error("executeQuery() must be implemented by adapter");
  }

  async close() {
    throw new Error("close() must be implemented by adapter");
  }
}

module.exports = BaseDB;