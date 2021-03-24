const Database = require('../services/Database');
var ObjectId = require('mongodb').ObjectID;
const yahooFinance = require('yahoo-finance');
var StockSymbolLookup = require('stock-symbol-lookup');

async function searchStocksBy(method, data) {
    let res;
    if (method === "_id") {
        res = await Database.collections.stocksCollection.find({ _id: data }).toArray()
    } else {
        res = await Database.collections.stocksCollection.find({ [method]: data }).toArray();
    }
    // console.log(res);
    return res;
}

async function registerBoughtStock(method, data, userID) {
    return Database.collections.usersCollection.update({ _id: ObjectId(userID) }, { $push: { operations: data } });
    // return Database.collections.usersCollection.insertOne({ [method]: data });
}

async function getUserOperation(userID) {     // get a specific operation of user by operations ID.
    return Database.collections.usersCollection.find({ "_id": userID });
}

async function updateOperation(method, data, userID, operationId) {
    return Database.collections.usersCollection.updateOne({ _id: ObjectId(userID), operations: { $elemMatch: { _id: ObjectId(operationId) } } }, { $set: { "operations.$.status": data.status, "operations.$.closingDate": data.closingDate, "operations.$.closingPrice": data.closingPrice } });
}

async function getUsersOperations(data) {
    return Database.collections.usersCollection.find({ _id: ObjectId(data) }).toArray();
}

async function getAllStocks() {
    return Database.collections.stocksCollection.find().toArray();
}


// ---------------- CALLS TO YAHOO FINANCE ----------------

async function getStockDetails(symbol, startDate, endDate) {
    let result;
    await yahooFinance.historical({
        symbol: symbol, //'APPL'
        from: startDate,  //'2012-01-01'
        to: endDate, // '2012-12-31'
        // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
    }, function (err, quotes) {
        if (err) {
            // return false;
            // console.log(err)
            result = false;
        }
        // console.log("quotes");
        // return quotes;
        result = quotes;
    });
    return result;
}


// ---------------- CALLS TO STOCK-SYMBOL-LOOKUP ----------------

async function getSymbols() {
    StockSymbolLookup.loadData()
        .then((data) => {
            return data;
            // this can currently only be done server-side.
            // data is now available to be searched inside or outside of this function.
        });
}


module.exports.searchStocksBy = searchStocksBy;
module.exports.registerBoughtStock = registerBoughtStock;
module.exports.getUserOperation = getUserOperation;
module.exports.updateOperation = updateOperation;
module.exports.getUsersOperations = getUsersOperations;
module.exports.getStockDetails = getStockDetails;
module.exports.getAllStocks = getAllStocks;