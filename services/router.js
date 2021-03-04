const express = require('express');
const router = new express.Router();
const Token = require('../controllers/Token');
const User = require('../controllers/User');


router.route('/validate-token').post(Token.post);
router.route('/register-user').post(User.registerUser);

module.exports = router;