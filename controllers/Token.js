async function post(req, res, next) {
    var token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, app.get('key'), (err, decoded) => {
            if (err) {
                res.status(500).send("Se cerró la sesión debido a un error");
            } else {
                res.status(200).send("Success");
            }
        });
    } else {
        res.status(500).send("Se cerró la sesión debido a un error");
    }
}

module.exports.post = post;