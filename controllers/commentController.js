const Comment = require('../models/comment');
const Post = require('../models/post');
const { body, validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");

//Create new comment
exports.createComment = [
    //Validate and sanitize input fields
    body('comment')
    .trim()
    .isLength({ min: 1, max: 75 })
    .escape()
    .withMessage('Please provide a comment'),

    async (req, res) => {
        const token = req.cookies.token
        const decodedToken = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN)
        const loggedInUserID =  decodedToken.id
        const {comment} = req.body
        const post_id = req.params.postID

        const post = await Post.findById(post_id)

        try{
             // Extract the validation errors from a request.
             const errors = validationResult(req);
             if(!errors.isEmpty()){
                 return res.status(400).json({ error: errors.array() })
             }

             //create and save new comment 
             const new_comment = new Comment({
                author: loggedInUserID,
                belongs_to_post: post_id,
                text: comment,
             })

             await new_comment.save()

             //Update comments array of the post the new comment belongs to
             post.comments.push(new_comment._id)
             await post.save()

             return res.status(201).json({new_comment})
        } catch (err){
            return res.status(500).json({ message: 'Internal server error', err})
        }
    }
];

// Get comments from a specific post
exports.getComments = async (req, res) => {
    const post_id = req.params.postID

    // Find comments related to this post and populate their authors
    const comments = await Comment.find({ belongs_to_post: post_id })
    .populate('author', 'username') // Populate only the username field of the author
    .select('author text time_stamp') // Explicitly select the fields to return
    .sort({ time_stamp: -1 });

    if(comments){
        return res.status(200).json(comments)
    } else {
        return res.status(400).json({msg: "No Comments found for this post"})
    }
};