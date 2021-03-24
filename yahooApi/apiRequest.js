var unirest = require("unirest");

var req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart");

req.query({
    "interval": "5m",
    "symbol": "AMRN",
    "range": "1d",
    "region": "US"
});

req.headers({
    "x-rapidapi-key": "edc0f725b4mshbcead6df9aa251fp1d9104jsne48457972759",
    "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
    "useQueryString": true
});


req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
});