const Database = require( '../services/Database' );
const db = Database.getDb();
const usersCollection = db.collection('Users');

async function registerUser(name, lastName, email, hash) {
    usersCollection.find({ email: email }).toArray().then((results) => {
        if (results.length > 0) {
            return 400;
        } 
        else {
            let user = {
                name: name,
                email: email,
                password: hash,
                lastName: lastName,
                operations: []
            };
            usersCollection.insertOne(user).then((response) => {
                let payload = {
                    email: email,
                    id: response.insertedId
                }
                let token = jwt.sign(payload, process.env.KEY, {
                    expiresIn: 604800
                });
                user.password = null;
                user.token = token;
                user.insertedId = response.insertedId;
                return user;
            })
            .catch((err) => {
                console.log('insertion error');
                console.log(err);
                return 500;
            })
        }
    })
    .catch((err) => {
        console.log(err);
        return 500;
    });
}

module.exports.registerUser = registerUser;