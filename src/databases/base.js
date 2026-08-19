class BaseDB {

    async connect() {
        throw new Error("connect() must be implemented");
    }

    async getSchema() {
        throw new Error("getSchema() must be implemented");
    }

    async validateQuery(query) {
        throw new Error("validateQuery() must be implemented");
    }

    async executeQuery(query) {
        throw new Error("executeQuery() must be implemented");
    }
}

module.exports = BaseDB;