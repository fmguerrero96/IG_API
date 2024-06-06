const express = require("express");
const router = express.Router();
const passport = require('passport');

// authentication middleware function to protect routes
const authenticateJWT = passport.authenticate('jwt', { session: false });

const user_controller = require('../controllers/userController');

// Create new user
router.post('/users', user_controller.createUser);

// Login
router.post('/users/login', user_controller.login);

// Send single user info (protected route)
router.get('/user', authenticateJWT, user_controller.getUser);

module.exports = router;