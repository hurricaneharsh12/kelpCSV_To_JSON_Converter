const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Import users from CSV
router.post('/users/import', (req, res) => userController.importUsers(req, res));

// Get all users
router.get('/users', (req, res) => userController.getUsers(req, res));

// Get age distribution
router.get('/users/age-distribution', (req, res) => userController.getAgeDistribution(req, res));

module.exports = router;