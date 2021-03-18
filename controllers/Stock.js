const Stock = require('../dbApi/Stock');
const sanitize = require('mongo-sanitize'); //eliminar codigo de los fields que manda el front
const jwt = require('jsonwebtoken'); //autenticar usuarios con tokens

async function searchStock(req, res, next) {

    if (!req.body.searchString) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let searchString = sanitize(req.body.searchString);
    let token = sanitize(req.body.token);

    let verifiedToken = jwt.verify(token, process.env.KEY, function (err, result) {
        console.log(result);
    });

    if (!verifiedToken) {
        return res.status(401).send("Usuario invalido.");
    } else {
        try {
            result = await Stock.searchStocksBy('stockCode', searchString);
        }
        catch (err) {
            console.log(err);
            return res.status(500).send("Error interno del sistema");
        }
    }
    return res.status(200).send(result);
}


async function getStockDetails(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId && !req.body.stockCode) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let stockCode = sanitize(req.body.stockCode);
    // revisar si es un user valido (no se como xd supongo usamos el userId)

    let verifiedToken = jwt.verify(token, process.env.KEY, function (err, result) {
        console.log(result);
    });

    console.log(verifiedToken);

    try {
        result = await Stock.getStockDetails('APPL', '2012-01-01', '2012-12-31');
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }
    return res.status(200).send(result);

}

async function buyStock(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId && !req.body.stockCode && !req.body.amountBought && !req.body.startingPrice) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let stockCode = sanitize(req.body.stockCode);
    let amountBought = sanitize(req.body.amountBought);
    let startingPrice = sanitize(req.body.startingPrice);

    // revisar si es un user valido (no se como xd supongo usamos el userId)
    try {
        let result = await Stock.searchStocksBy("stockCode", stockCode);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }

    if (result) {
        let stockOperation = {      // falta insertar mas datos obtenidos de la api de poligon
            stockCode: stockCode,
            amountBought: amountBought,
            startingPrice: startingPrice
        }
        try {
            let insertResult = await Stock.registerBoughtStock("operations", stockOperation, userId);   // checar dbApi Stock.js corregir parametros enviados
        }
        catch (err) {
            return res.status(500).send("Error interno del sistema");
        }

    } else {
        // return ese stock no existe
    }
    return res.status(200).send();
}


async function sellStock(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId && !req.body._id && !req.body.closingPrice) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let _id = sanitize(req.body._id);
    let closingPrice = sanitize(req.body.closingPrice);

    // revisar si es un user valido (no se como xd supongo usamos el userId)
    try {
        let result = await Stock.getUserOperation("_id", _id);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }

    if (result) {
        let stockUpdateData = {
            closingPrice: closingPrice,
            closingDate: 'SET TODAYS DATE HERE',            // falta poner la fecha de hoy
            status: 'closed'
        }
        try {
            let insertResult = await Stock.updateOperation("operations", stockUpdateData);  //no se si hice correctamente la query
        }
        catch (err) {
            return res.status(500).send("Error interno del sistema");
        }

    } else {
        // return esta operacion no existe.
    }
    return res.status(200).send();
}

async function getUserOperations(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);

    // revisar si es un user valido (no se como xd supongo usamos el userId)
    try {
        let result = await Stock.getUserOperations("_id", userId);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }

    return res.status(200).send(result.operations);
}


module.exports.searchStock = searchStock;
module.exports.getStockDetails = getStockDetails;
module.exports.buyStock = buyStock;
module.exports.sellStock = sellStock;
module.exports.getUserOperations = getUserOperations;