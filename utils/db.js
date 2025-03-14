const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');

const loadDatabase = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const saveDatabase = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

module.exports = {
    loadDatabase,
    saveDatabase
}; 