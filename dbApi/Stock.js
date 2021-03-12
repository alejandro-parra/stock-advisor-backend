const Database = require('../services/Database');


async function searchStocksBy(method, data) {
    return Database.collections.stocksCollection.find({ [method]: data }).toArray();
}

async function registerBoughtStock(method, data) {
    return Database.collections.usersCollection.insertOne({ [method]: data });
}

module.exports.searchStocksBy = searchStocksBy;
module.exports.registerBoughtStock = registerBoughtStock;