const fs = require('fs').promises;
const path = require('path');
const DatabaseInterface = require('./DatabaseInterface');

class JsonDatabase extends DatabaseInterface {
    constructor(dataDir = './backend/data') {
        super();
        this.dataDir = dataDir;
        this.type = 'json';
    }

    async connect() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            console.log('JSON database connected');
            return true;
        } catch (error) {
            console.error('Failed to connect to JSON database:', error);
            throw error;
        }
    }

    async disconnect() {
        console.log('JSON database disconnected');
        return true;
    }

    async _readFile(table) {
        const filePath = path.join(this.dataDir, `${table}.json`);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this._writeFile(table, []);
                return [];
            }
            throw error;
        }
    }

    async _writeFile(table, data) {
        const filePath = path.join(this.dataDir, `${table}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }

    async create(table, item) {
        const items = await this._readFile(table);
        const newItem = { ...item, id: Date.now().toString() };
        items.push(newItem);
        await this._writeFile(table, items);
        return newItem;
    }

    async read(table, id = null) {
        const items = await this._readFile(table);
        if (id) {
            return items.find(item => item.id === id) || null;
        }
        return items;
    }

    async update(table, id, data) {
        const items = await this._readFile(table);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) {
            return null;
        }
        items[index] = { ...items[index], ...data };
        await this._writeFile(table, items);
        return items[index];
    }

    async delete(table, id) {
        const items = await this._readFile(table);
        const filteredItems = items.filter(item => item.id !== id);
        if (items.length === filteredItems.length) {
            return false;
        }
        await this._writeFile(table, filteredItems);
        return true;
    }

    async find(table, conditions = {}) {
        const items = await this._readFile(table);
        return items.filter(item => {
            return Object.keys(conditions).every(key => 
                item[key] === conditions[key]
            );
        });
    }

    async query(sql, params = []) {
        throw new Error('Raw SQL queries not supported in JSON database');
    }
}

module.exports = JsonDatabase;