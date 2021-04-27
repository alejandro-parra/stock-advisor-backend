const mongo = require('mongodb').MongoClient
var db;
var client;
const collections = {
    usersCollection: null,
    stocksCollection: null
}

async function connectToServer() {
    try {
        client = await mongo.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10 });
        console.log('Connected to mongodb');
        db = await client.db('StockAdvisor');
        collections.usersCollection = db.collection('Users');
        collections.stocksCollection = db.collection('Stocks');
        return db; // client.db('StockAdvisor');
    } catch (err) {
        console.log("error connecting to mongo: ", err);
        return null;
    }
}

async function closeDatabase() {
  await client.close();
}

module.exports.closeDatabase = closeDatabase;
module.exports.connectToServer = connectToServer;
module.exports.db = db;
module.exports.collections = collections;