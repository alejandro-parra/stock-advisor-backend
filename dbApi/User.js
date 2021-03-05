const Database = require( '../services/Database' );

async function registerUser(name, lastName, email, hash) { // arreglar esta funcion
    return Database.prueba.usersCollection.find({ email: email }).toArray().then((results) => {
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
            return Database.prueba.usersCollection.insertOne(user).then((response) => {
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

async function findUsersBy(method, data) {
    
    return Database.prueba.usersCollection.find({ [method]: data }).toArray();
    // return usersCollection.find({ email: email }).toArray()
}

async function updateUserBy(method, data, params) {
    return Database.prueba.usersCollection.updateOne({ [method]: data }, params);
    // return usersCollection.updateOne({ token: token }, { $set: { password: hash }, $unset: { token: "", tokenTime: "" } }); // example of reset password
}

async function deleteUserBy(method, data) {
    return Database.prueba.usersCollection.deleteOne({ [method]: data })
    // return usersCollection.deleteOne({ _id: new ObjectId(id) })
}

module.exports.registerUser = registerUser;
module.exports.findUsersBy = findUsersBy;
module.exports.updateUserBy = updateUserBy;
module.exports.deleteUserBy = deleteUserBy;