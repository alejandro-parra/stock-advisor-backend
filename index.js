// run locally  mail=qdrwshctkvojeexp mailUser=alexparra07@gmail.com key=ab12n23j3423DSA3 node index.js
// const mongo = require('mongodb').MongoClient
const Database = require('./services/Database');
const router = require('./services/router');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet') //protege de ataques con URL
const bodyParser = require('body-parser') //parsear JSONs para enviarlos al front
const cors = require('cors') //dominios permitidos 
const bcrypt = require('bcrypt'); //encripta
const crypto = require('crypto'); //random string generator (no es muy bueno para encriptar)

const Ddos = require('ddos')
const jwt = require('jsonwebtoken'); //autenticar usuarios con tokens
const fs = require('fs'); //filesystem del servidor
var ObjectId = require('mongodb').ObjectID;
const ddos = new Ddos({ burst: 10, limit: 15 })
const saltRounds = 10;
// const url = "mongodb+srv://stockmaster:kycpaco_280198@db.s775v.mongodb.net/StockAdvisor?retryWrites=true&w=majority";
const key = process.env.key;

var sanitize = require('mongo-sanitize'); //eliminar codigo de los fields que manda el front
// const { check, validationResult } = require('express-validator'); //checar tipos de datos

const url = process.env.DATABASE_URL;

const app = express();
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
const protectedRoutes = express.Router(); //middleware para verificar si el usuario está loggeado

protectedRoutes.use((req, res, next) => {
    let token = sanitize(req.headers['access-token']);
    let userId = sanitize(req.body.userId);
    if (token) {
        jwt.verify(token, app.get('key'), (err, decoded) => {
            if (err) {
                res.status(500).send("Logout");
            } else {
                if (decoded.id == userId) {
                    next();
                } else {
                    res.status(500).send("Logout");
                }
            }
        });
    } else {
        res.status(500).send("Logout");
    }
});

// app.set('key', process.env.key);

app.use(ddos.express);
app.use(helmet())
const whitelist = ['http://localhost:4200/'] //dominios que pueden entrar y hacer llamadas al back
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
//app.use(cors({origin: '*', optionsSuccessStatus: 200}))

async function startup() {
    try {
        let db = await Database.connectToServer();
        if (db === null) throw "Error connecting to database.";
        app.use('/api', router);
    
        app.listen(3000, function () {
            console.log('listening on 3000')
        })
    } catch (err) {
        console.log("error at index: ", err)
    }
}


startup();

// mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10 }, (err, client) => {


//     //DATABASE VARIABLES
//     // const db = client.db('StockAdvisor')
//     // const usersCollection = db.collection('Users');

//     //AUXILIARY FUNCTIONS


//     //ENDPOINTS
//     /**
//         * @desc Verify that the user token is not expired
//         * @param {Object} req.headers[access-token] - The user token he wants to validate
//     */

//     a

//     if (err) {
//         console.error(err)
//         return
//     }
// })

