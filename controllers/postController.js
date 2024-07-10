const Post = require('../models/post');
const User = require('../models/user');
const { body, validationResult} = require('express-validator');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')
const jwt = require("jsonwebtoken");
const lodash = require("lodash");

//Create new post
exports.createPost = [
    //Validate and sanitize input fields
    body('caption')
        .trim()
        .escape()
        .isLength({ max: 150 })
        .withMessage('Captions cannot be longer than 150 characters.'),

    //upload Middleware function to only accept one file
    uploadMiddleware.single('file'),

    async (req, res) => {
        const{author, caption} = req.body
        const {originalname, path} = req.file

        //get file extension (jpeg, png, jpg)
        const parts = originalname.split('.')
        const extension = parts[parts.length - 1]

        //rename image path
        const newPath = path + '.' + extension
        fs.renameSync(path, newPath)

        try{
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({ error: errors.array() })
            }

            //Find author of post in db
            const user = await User.findOne({_id: author})

            //Create and save the post
            const post = new Post({
                author: author,
                caption: caption,
                picture: newPath,
            })
            const savedPost = await post.save()

            // Add the created post into corresponding author's array of posts
            user.posts.push(savedPost._id)
            await user.save()

            return res.status(200).json({message: 'Post has been created'})
        } catch(err) {
            console.log(err)
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
];

// Get feed
exports.getFeed = async (req, res) => {
    //decode jwt to get the user id
    const token = req.cookies.token
    const decodedToken = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN)
    const loggedInUserID =  decodedToken.id

    try{
        // Get the users followed by the logged-in user
        const user = await User.findById(loggedInUserID).populate('following')

        // Get the posts from the followed users
        const followingIds = user.following.map(followedUser => followedUser._id)
        const posts = await Post.find({ author: { $in: followingIds } }).populate('author')

        // Shuffle posts
        const shuffledPosts = lodash.shuffle(posts)

        return res.status(200).json(shuffledPosts);
    } catch(err) {
        console.error('Error fetching feed:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }

    
};

exports.like = async (req, res) => {
    //decode jwt to get the user id
    const token = req.cookies.token
    const decodedToken = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN)
    const loggedInUserID =  decodedToken.id
    const postId = req.params.postId

    try{
        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user already liked the post
        const hasLiked = post.likes_count.includes(loggedInUserID);
        if (hasLiked) {
            // Unlike the post/remove id from likes array
            post.likes_count.pull(loggedInUserID);
        } else {
            // Like the post/add id into likes array
            post.likes_count.push(loggedInUserID);
        }

        await post.save();
        // res.status(200).json(post);
        res.status(200).json({ likes_count: post.likes_count, hasLiked: !hasLiked });

    } catch(err){
        console.error('Error liking/unliking post:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPost = async (req, res) => {
    const post_id = req.params.id
    
    try{
        const post = await Post.findById(post_id).populate('author')
        if(post){
            return res.status(200).json(post)
        } else {
            return res.status(404).json({message: 'Post not found'})
        }
    } catch(err){
        //Handle potential database query error
        return res.status(500).json({ message: 'Internal server error', err })
    }
};

//Update post
exports.updatePost = [
    //Validate and sanitize input fields
    body('caption')
        .trim()
        .escape()
        .isLength({ max: 150 })
        .withMessage('Captions cannot be longer than 150 characters.'),

    async (req, res) => {
        const newCaption = req.body.caption
        const post_id = req.params.id

        try{
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({ error: errors.array() })
            }

            //find post to be updated
            const post = await Post.findById(post_id)
            //update caption
            post.caption = newCaption
            //save post
            await post.save()
            return res.status(200).json(post)

        }catch(err){
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
];