const mongo = require('mongodb').MongoClient
const url = process.env.DATABASE_URL

module.exports = {

    connectToServer: function( callback ) {
        mongo.connect(
            url,
            {useNewUrlParser: true}, 
            function(err, client) {
                _db  = client.db('StockAdvisor');
                console.log('Connected to mongodb');
                return callback(err);
            }
        );
    },
    getDb: function() {
        return _db;
    }
};


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