const Post = require('../models/post');
const User = require('../models/user');
const { body, validationResult} = require('express-validator');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')

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