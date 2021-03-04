const mongo = require('mongodb').MongoClient
const url = process.env.DATABASE_URL
let db;
let usersCollection;
let stocksCollection;


async function connectToServer() {
    try {
        let client = await mongo.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10 });
        console.log('Connected to mongodb');
        db = client.db('StockAdvisor');
        usersCollection = db.collection('Users');
        stocksCollection = db.collection('Stocks');
        return db; // client.db('StockAdvisor');
    } catch(err) {
        console.log("error connecting to mogno: ", err);
        return null;
    }
   
}



module.exports.connectToServer = connectToServer;
module.exports.db = db;
module.exports.usersCollection = usersCollection;
module.exports.stocksCollection = stocksCollection;


// module.exports = {
//     connectToServer: function( callback ) {
//         mongo.connect(
//             url,
//             {useNewUrlParser: true}, 
//             function(err, client) {
//                 _db  = client.db('StockAdvisor');
//                 console.log('Connected to mongodb');
//                 return callback(err);
//             }
//         );
//     },
//     getDb: function() {
//         return _db;
//     }
// };


// mongo.connect(
//     url, 
//     { 
//         useNewUrlParser: true, 
//         useUnifiedTopology: true, 
//         poolSize: 10 
//     }, 
//     (err, client) => {
//     }
// )