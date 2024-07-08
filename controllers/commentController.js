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