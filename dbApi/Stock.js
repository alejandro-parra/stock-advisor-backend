const Database = require('../services/Database');


async function searchStocksBy(method, data) {
    return Database.collections.stocksCollection.find({ [method]: data }).toArray();
}

async function registerBoughtStock(method, data) {
    return Database.collections.usersCollection.insertOne({ [method]: data });
}

async function getUserOperation(method, data, userID) {     // get a specific operation of user by operations ID.
    return Database.collections.usersCollection.find({ "_id": userID, "operations": { [method]: data } });
}

async function updateOperation(method, data, userID) {
    return Database.collections.usersCollection.updateOne({ "_id": userID }, { [method]: data });
}

async function getUsersOperations(method, data) {
    return Database.collections.stocksCollection.find({ [method]: data }).toArray();
}

module.exports.searchStocksBy = searchStocksBy;
module.exports.registerBoughtStock = registerBoughtStock;
module.exports.getUserOperation = getUserOperation;
module.exports.updateOperation = updateOperation;
module.exports.getUsersOperations = getUsersOperations;