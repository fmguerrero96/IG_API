const express = require("express");
const router = express.Router();

const user_controller = require('../controllers/userController');

// Create new user
router.post('/users', user_controller.createUser);

module.exports = router;