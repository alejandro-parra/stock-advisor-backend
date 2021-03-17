const express = require('express');
const router = new express.Router();
const Token = require('../controllers/Token');
const User = require('../controllers/User');

// User apis
router.route('/validate-token').post(Token.post);
router.route('/register-user').post(User.registerUser);
router.route('/login-user').post(User.loginUser);
router.route('/reset-password').post(User.resetPassword);
router.route('/send-recovery-token').post(User.sendRecoveryToken);
router.route('/delete-user').post(User.deletUser);

// Stock apis

module.exports = router;