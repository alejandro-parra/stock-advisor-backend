const express = require('express');
const router = new express.Router();
const Token = require('../controllers/Token')


router.router('/validate-token').post(Token.post);


module.exports = router;