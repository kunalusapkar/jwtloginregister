const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');


router.get('/login', viewController.login);
router.get('/register', viewController.register);
router.use(authController.isLoggedIn);
router.get('/', viewController.home);

module.exports = router;