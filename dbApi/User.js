const Database = require('../services/Database');
var ObjectId = require('mongodb').ObjectID;

async function registerUser(user) {
    return Database.collections.usersCollection.insertOne(user);
}

async function findUsersBy(method, data) {

    return Database.collections.usersCollection.find({ [method]: data }).toArray();
    // return usersCollection.find({ email: email }).toArray()
}

async function findUsersById(data) {

    return Database.collections.usersCollection.find({ _id: ObjectId(data) }).toArray();
    // return usersCollection.find({ email: email }).toArray()
}

async function updateUserBy(method, data, params) {
    return Database.collections.usersCollection.updateOne({ [method]: data }, params);
    // return usersCollection.updateOne({ token: token }, { $set: { password: hash }, $unset: { token: "", tokenTime: "" } }); // example of reset password
}

async function deleteUserBy(method, data) {
    return Database.collections.usersCollection.deleteOne({ [method]: data })
    // return usersCollection.deleteOne({ _id: new ObjectId(id) })
}

module.exports.registerUser = registerUser;
module.exports.findUsersBy = findUsersBy;
module.exports.updateUserBy = updateUserBy;
module.exports.deleteUserBy = deleteUserBy;
module.exports.findUsersById = findUsersById;