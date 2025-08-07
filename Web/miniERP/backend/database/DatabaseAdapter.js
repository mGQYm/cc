const JsonDatabase = require('./JsonDatabase');

class DatabaseAdapter {
    constructor(config = {}) {
        this.config = config;
        this.database = null;
        this.initializeDatabase();
    }

    initializeDatabase() {
        switch (this.config.type) {
            case 'json':
            default:
                this.database = new JsonDatabase(this.config.dataDir);
                break;
            
            case 'mysql':
                // Future MySQL implementation
                // this.database = new MySQLDatabase(this.config);
                throw new Error('MySQL database not implemented yet');
                
            case 'postgresql':
                // Future PostgreSQL implementation
                // this.database = new PostgreSQLDatabase(this.config);
                throw new Error('PostgreSQL database not implemented yet');
                
            case 'mongodb':
                // Future MongoDB implementation
                // this.database = new MongoDBDatabase(this.config);
                throw new Error('MongoDB database not implemented yet');
        }
    }

    async connect() {
        return await this.database.connect();
    }

    async disconnect() {
        return await this.database.disconnect();
    }

    async query(sql, params = []) {
        return await this.database.query(sql, params);
    }

    async create(table, data) {
        return await this.database.create(table, data);
    }

    async read(table, id = null) {
        return await this.database.read(table, id);
    }

    async update(table, id, data) {
        return await this.database.update(table, id, data);
    }

    async delete(table, id) {
        return await this.database.delete(table, id);
    }

    async find(table, conditions = {}) {
        return await this.database.find(table, conditions);
    }

    async migrate(fromType, toType, config) {
        // Future migration functionality
        console.log(`Migrating from ${fromType} to ${toType}`);
        
        switch (fromType) {
            case 'json':
                return await this.migrateFromJson(toType, config);
            default:
                throw new Error(`Migration from ${fromType} not supported`);
        }
    }

    async migrateFromJson(toType, config) {
        const jsonDb = new JsonDatabase(this.config.dataDir);
        await jsonDb.connect();
        
        const tables = ['products', 'customers', 'orders', 'inventory'];
        const migrationData = {};
        
        for (const table of tables) {
            migrationData[table] = await jsonDb.read(table);
        }
        
        // Here you would implement the actual migration to the new database
        // For now, we'll just return the data that would be migrated
        console.log('Migration data prepared:', Object.keys(migrationData));
        
        return migrationData;
    }
}

module.exports = DatabaseAdapter;