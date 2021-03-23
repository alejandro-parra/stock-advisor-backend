const Stock = require('../dbApi/Stock');
const User = require("../dbApi/User");
const sanitize = require('mongo-sanitize'); //eliminar codigo de los fields que manda el front
const jwt = require('jsonwebtoken'); //autenticar usuarios con tokens
var ObjectId = require('mongodb').ObjectID;

async function searchStock(req, res, next) {

    console.log(req.body);
    let searchString = sanitize(req.body.searchString);
    let userId = sanitize(req.body.userId);
    let token = sanitize(req.headers['access-token']);


    let verifiedToken;
    await jwt.verify(token, process.env.KEY, function (err, result) {
        verifiedToken = result;
        // console.log(result);
    });


    if (!verifiedToken) {
        return res.status(401).send("Usuario invalido.");
    } else {
        if (!req.body.searchString) {
            try {
                result = await Stock.getAllStocks();
            }
            catch (err) {
                console.log(err);
                return res.status(500).send("Error interno del sistema");
            }
        } else {
            try {
                result = await Stock.searchStocksBy('stockName', searchString);
            }
            catch (err) {
                console.log(err);
                return res.status(500).send("Error interno del sistema");
            }
        }

    }

    return res.status(200).send(result);
}


async function getStockDetails(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId && !req.body.stockCode && !req.body.dateTime) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let stockCode = sanitize(req.body.stockCode);

    let token = sanitize(req.headers['access-token']);


    let verifiedToken;
    await jwt.verify(token, process.env.KEY, function (err, result) {
        verifiedToken = result;
        // console.log(result);
    });

    if (!verifiedToken) {
        return res.status(401).send("Usuario invalido.");
    }

    let data;
    let dataStock;
    var datetime = new Date();
    console.log(datetime);
    let year = datetime.getFullYear();
    let month = datetime.getMonth();
    month = (month + 1) < 10 ? "0" + (month + 1) : (month + 1);
    let day = datetime.getDate();
    day = (day) < 10 ? "0" + (day) : (day);
    let startDate = `${year}-${month}-${day}`;
    let endDate = `${year - 5}-${month}-${day}`;
    console.log(stockCode);
    console.log(userId);
    let userInfo = await User.findUsersById(userId);
    
    try {
        dataStock = await Stock.searchStocksBy('_id', new ObjectId(stockCode));
        if (dataStock.length !== 1) return res.status(404).send("No se encontro en el sistema");
        data = await Stock.getStockDetails(dataStock[0].stockCode, endDate, startDate);
        if (data.length === 0) return res.status(404).send("Yahoo esta caido :(");
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }
    console.log(data);
    lastDay = data[0].date;
    let year2 = lastDay.getFullYear();
    let month2 = lastDay.getMonth();
    month2 = (month2 + 1) < 10 ? "0" + (month2 + 1) : (month2 + 1);
    let day2 = lastDay.getDate();
    day2 = (day2 + 1) < 10 ? "0" + (day2 + 1) : (day2 + 1);
    let diaDeCorte = `${year2}-${month2}-${day2}`

    let result = {
        stockName: dataStock[0].stockName,
        stockCode: dataStock[0].stockCode,
        companyImage: dataStock[0].companyImage,
        actualPrice: data[0].close,
        updateDate: diaDeCorte,
        graphData: data.map( (item) => { 
            dataInfo = item.date;
            let year3 = dataInfo.getFullYear();
            let month3 = dataInfo.getMonth();
            month3 = (month3 + 1) < 10 ? "0" + (month3 + 1) : (month3 + 1);
            let day3 = dataInfo.getDate();
            day3 = (day3) < 10 ? "0" + (day3) : (day3);
            let diaDeCorte2 = `${year3}-${month3}-${day3}`
            return {time: diaDeCorte2, value: item.close} 
        }),
        myOperations: userInfo[0].operations.map( (item) => { if(item.stockCode === dataStock[0].stockCode) return item })
    }
    
    return res.status(200).send(result);

}

async function buyStock(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId && !req.body.stockCode && !req.body.amountBought) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let stockCode = sanitize(req.body.stockCode);
    let amountBought = sanitize(req.body.amountBought);
    let startingPrice = sanitize(req.body.startingPrice);

    let token = sanitize(req.headers['access-token']);

    let verifiedToken;
    await jwt.verify(token, process.env.KEY, function (err, result) {
        verifiedToken = result;
        // console.log(result);
    });

    if (!verifiedToken) {
        return res.status(401).send("Usuario invalido.");
    }
    var datetime = new Date();
    // console.log(datetime);
    let year = datetime.getFullYear();
    let month = datetime.getMonth();
    month = (month + 1) < 10 ? "0" + (month + 1) : (month + 1);
    let day = datetime.getDate();
    day = (day) < 10 ? "0" + (day) : (day);
    let todayDate = `${year}-${month}-${day}`;
    let yesterdayDate = `${year - 1}-${month}-${day}`; // le restamos un año debido a que la api no toma las fechas de los fines de semana
    let data;
    let dataStock;
    try {
        data = await Stock.getStockDetails(stockCode, yesterdayDate, todayDate);
        dataStock = await Stock.searchStocksBy('stockCode', stockCode);
        // console.log(dataStock[0]);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }
    // console.log(data);
    lastDay = data[0].date;
    let year2 = lastDay.getFullYear();
    let month2 = lastDay.getMonth();
    month2 = (month2 + 1) < 10 ? "0" + (month2 + 1) : (month2 + 1);
    let day2 = lastDay.getDate();
    day2 = (day2 + 1) < 10 ? "0" + (day2 + 1) : (day2 + 1);
    let diaDeCorte = `${year2}-${month2}-${day2}`

    if (data) {
        let stockOperation = {
            stockCode: stockCode,
            companyImg: dataStock[0].companyImage,
            stockName: dataStock[0].stockName,
            creationDate: diaDeCorte,
            amountBought: amountBought,
            status: "active",
            startingPrice: data[0].close
        }
        console.log(stockOperation);
        try {
            let insertResult = await Stock.registerBoughtStock("operations", stockOperation, userId);   // checar dbApi Stock.js corregir parametros enviados
        }
        catch (err) {
            console.log(err);
            return res.status(500).send("Error interno del sistemaaa");
        }

    } else {
        return res.status(400).send("Error, el stock no existe en el sistema");
    }
    return res.status(200).send("Compra hecha de manera exitosa");
}


async function sellStock(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId && !req.body._id && !req.body.closingPrice) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let _id = sanitize(req.body._id);
    let closingPrice = sanitize(req.body.closingPrice);
    let token = sanitize(req.headers['access-token']);


    let verifiedToken;
    await jwt.verify(token, process.env.KEY, function (err, result) {
        verifiedToken = result;
        // console.log(result);
    });


    if (!verifiedToken) {
        return res.status(401).send("Usuario invalido.");
    }

    var datetime = new Date();
    console.log(datetime);
    let year = datetime.getFullYear();
    let month = datetime.getMonth();
    month = (month + 1) < 10 ? "0" + (month + 1) : (month + 1);
    let day = datetime.getDate();
    day = (day) < 10 ? "0" + (day) : (day);
    let startDate = `${year}-${month}-${day}`;
    let end = `${year}-${month}-${day - 1}`;
    let data;
    let dataStock;
    try {
        data = await Stock.getStockDetails('AAPL', end, startDate);
        dataStock = await Stock.searchStocksBy('stockCode', stockCode)
        console.log(dataStock[0]);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }
    console.log(data);
    console.log(dataStock);
    lastDay = data[0].date;
    let year2 = lastDay.getFullYear();
    let month2 = lastDay.getMonth();
    month2 = (month2 + 1) < 10 ? "0" + (month2 + 1) : (month2 + 1);
    let day2 = lastDay.getDate();
    day2 = (day2 + 1) < 10 ? "0" + (day2 + 1) : (day2 + 1);
    let diaDeCorte = `${year2}-${month2}-${day2}`
    try {
        let result = await Stock.getUserOperation("_id", _id);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Error interno del sistema");
    }

    if (result) {
        let stockUpdateData = {
            closingPrice: data[0].close,
            closingDate: diaDeCorte,
            status: 'closed'
        }
        try {
            let insertResult = await Stock.updateOperation("operations", stockUpdateData);  //no se si hice correctamente la query
        }
        catch (err) {
            return res.status(500).send("Error interno del sistema");
        }

    } else {
        return res.status(400).send("Esta operacion no existe");
    }
    return res.status(200).send("Compra finalizada de manera exitosa");
}

async function getUserOperations(req, res, next) {   // ------------ INCOMPLETA ----------------

    if (!req.body.userId) {
        return res.status(400).send("Datos Invalidos");
    }
    console.log(req.body);
    let userId = sanitize(req.body.userId);
    let token = sanitize(req.headers['access-token']);


    let verifiedToken;
    await jwt.verify(token, process.env.KEY, function (err, result) {
        verifiedToken = result;
        // console.log(result);
    });

    if (!verifiedToken) {
        return res.status(401).send("Usuario invalido.");
    }

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