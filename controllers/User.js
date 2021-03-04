const bcrypt = require('bcrypt'); //encripta
const sanitize = require('mongo-sanitize'); //eliminar codigo de los fields que manda el front
const User = require('../dbApi/User');

async function registerUser(req, res, next) {
    console.log(req.body);
    var password = sanitize(req.body.password);
    var email = sanitize(req.body.email);
    var name = sanitize(req.body.name);
    var lastName = sanitize(req.body.lastName);

    bcrypt.hash(password, saltRounds, function (err, hash) {
        var response = await User.registerUser(name, lastName, email, hash);
        if(response === 400) {
            return res.status(400).send("El correo ya existe para una cuenta.");
        }
        else if(response == 500) {
            return res.status(500).send("Error interno del sistema");
        }
        else if(response.user) {
            return res.status(200).send(response.user);
        }
    });
}

module.exports.registerUser = registerUser;


app.post('/register-user', [
    check('name').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('email').isEmail(),
    check('password').not().isEmpty()
], function (req, res) {
    
})