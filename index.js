const Database = require('./services/Database');
const router = require('./services/router');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet') //protege de ataques con URL
const bodyParser = require('body-parser') //parsear JSONs para enviarlos al front
const cors = require('cors') //dominios permitidos

const Ddos = require('ddos')
const jwt = require('jsonwebtoken'); //autenticar usuarios con tokens
const ddos = new Ddos({ burst: 10, limit: 15 })

var sanitize = require('mongo-sanitize'); //eliminar codigo de los fields que manda el front
const app = express();
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb', extended: true }));


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

app.use(ddos.express);
app.use(helmet())
const whitelist = ['http://localhost:4200'] //dominios que pueden entrar y hacer llamadas al back
const corsOptions = {
    origin: function (origin, callback) {       // -------------- AL TERMINAR EL PROYECTO ESTO SE TIENE QUE DESCOMENTAR (CORS) -----------------
        // if (whitelist.indexOf(origin) !== -1) {              
        callback(null, true)
        // } else {
        //     callback(new Error('Not allowed by CORS'))
        // }
    },
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

async function startup() {
    try {
        let db = await Database.connectToServer();
        if (db === null) throw "Error connecting to database.";
        app.use('/', router);

        app.listen(3000, function () {
            console.log('listening on 3000')
        })
    } catch (err) {
        console.log("error at index: ", err)
    }
}

startup();