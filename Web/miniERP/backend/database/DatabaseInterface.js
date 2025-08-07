class DatabaseInterface {
    constructor() {
        this.type = 'json';
    }
    
    async connect() {
        throw new Error('connect method must be implemented');
    }
    
    async disconnect() {
        throw new Error('disconnect method must be implemented');
    }
    
    async query(sql, params = []) {
        throw new Error('query method must be implemented');
    }
    
    async create(table, data) {
        throw new Error('create method must be implemented');
    }
    
    async read(table, id = null) {
        throw new Error('read method must be implemented');
    }
    
    async update(table, id, data) {
        throw new Error('update method must be implemented');
    }
    
    async delete(table, id) {
        throw new Error('delete method must be implemented');
    }
    
    async find(table, conditions = {}) {
        throw new Error('find method must be implemented');
    }
}

module.exports = DatabaseInterface;