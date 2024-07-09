const express = require("express");
const router = express.Router();
const passport = require('passport');

// authentication middleware function to protect routes
const authenticateJWT = passport.authenticate('jwt', { session: false });

const comment_controller = require('../controllers/commentController');

// Create new comment
router.post('/comment/:postID', authenticateJWT, comment_controller.createComment);

// Get comments from a post
router.get('/comment/:postID', comment_controller.getComments);

module.exports = router;