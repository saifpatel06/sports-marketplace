const uuid = require('uuid');
// load the database file
// add a unique id to each product
// save the database file

const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, 'database.json');

const loadDatabase = () => {
    const data = fs.readFileSync(databasePath, 'utf8');
    return JSON.parse(data);
};

const saveDatabase = (data) => {
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));
};

const addUniqueIdToProducts = (data) => {
    data.products.forEach((product, index) => {
        product.id = uuid.v4();
    });
};

const main = () => {
    const data = loadDatabase();
    addUniqueIdToProducts(data);
    saveDatabase(data);
};

main();