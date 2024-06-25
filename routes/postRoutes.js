const express = require("express");
const router = express.Router();
const passport = require('passport');

// authentication middleware function to protect routes
const authenticateJWT = passport.authenticate('jwt', { session: false });

const postController = require('../controllers/postController');

// Create new post
router.post('/post', authenticateJWT, postController.createPost);

// Get feed
router.get('/feed', authenticateJWT, postController.getFeed);

module.exports = router;