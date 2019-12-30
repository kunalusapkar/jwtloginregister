const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// router.get('/alltours', authController.protectRoutes, authController.restrictTo('admin'), tourController.allTours);
router.get('/alltours', authController.protectRoutes, authController.restrictTo('admin'), tourController.allTours);

module.exports = router;