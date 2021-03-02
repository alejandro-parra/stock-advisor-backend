const mongo = require('mongodb').MongoClient
const url = "mongodb+srv://stockmaster:kycpaco_280198@db.s775v.mongodb.net/StockAdvisor?retryWrites=true&w=majority";

module.exports = {

    connectToServer: function( callback ) {
        mongo.connect(
            url,
            {useNewUrlParser: true}, 
            function(err, client) {
                _db  = client.db('test_db');
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