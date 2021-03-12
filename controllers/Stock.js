const Stock = require('../dbApi/Stock');
const sanitize = require('mongo-sanitize'); //eliminar codigo de los fields que manda el front


async function searchStock(req, res, next) {

    if (!req.body.userId) {
        return res.status(400).send("Datos Invalidos");
    }

    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let searchString = sanitize(req.body.searchString);
    // revisar si es un user valido (no se como xd supongo usamos el userId)
    try {
        result = await Stock.searchStocksBy('stockName', searchString);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }
    return res.status(200).send(result);

}


async function getStockDetails(req, res, next) {

    if (!req.body.userId && !req.body.stockCode) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let stockCode = sanitize(req.body.stockCode);
    // revisar si es un user valido (no se como xd supongo usamos el userId)

    // Segun hacer una llamada a la api de polygon o a la BD (la BD se supone va a estar refrescando los datos de la api)?

    // try {
    //     result = await Stock.searchStocksBy('stockName', searchString);
    // }
    // catch (err) {
    //     console.log(err);
    //     return res.status(500).send("Error interno del sistema");
    // }
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
        let stockOperation = {
            stockCode: stockCode,
            amountBought: amountBought,
            startingPrice: startingPrice
        }
        try {
            let insertResult = await Stock.registerBoughtStock("operations", stockOperation);
        }
        catch (err) {
            return res.status(500).send("Error interno del sistema");
        }

    } else {
        // return ese stock no existe
    }
    return res.status(200).send();



}


module.exports.searchStock = searchStock;
module.exports.getStockDetails = getStockDetails;
module.exports.buyStock = buyStock;