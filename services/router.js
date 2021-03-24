const express = require('express');
const router = new express.Router();
const Token = require('../controllers/Token');
const User = require('../controllers/User');
const Stock = require('../controllers/Stock');

// User apis
router.route('/validate-token').post(Token.post);
router.route('/register-user').post(User.registerUser);
router.route('/login-user').post(User.loginUser);
router.route('/reset-password').post(User.resetPassword);
router.route('/send-recovery-token').post(User.sendRecoveryToken);
router.route('/delete-user').post(User.deleteUser);

// Stock apis
router.route('/search-stock').post(Stock.searchStock);
router.route('/get-stock-details').post(Stock.getStockDetails);
router.route('/buy-stock').post(Stock.buyStock);
router.route('/sell-stock').post(Stock.sellStock);
router.route('/my-operations').post(Stock.getUserOperations);

// prueba

router.route('/python').get(Stock.getStockPrediction);

module.exports = router;