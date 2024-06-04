const User = require('../models/user');
const bcrypt = require('bcrypt');
const { body, validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");

//Create User 
exports.createUser = [
     //Validate and sanitize input fields
     body('username')
        .trim()
        .isLength({ min: 4 })
        .escape()
        .withMessage('Username must be at least 4 charactes long.'),
    body('password')
        .trim()
        .isLength({ min: 5 })
        .escape()
        .withMessage('Password must be at least 5 charactes long'),
    
    async (req, res) => {
        const {username, password} = req.body;

        try {
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({ error: errors.array() })
            }
    
            //Check if username is unique
            const userExists = await User.findOne({username})
            if(userExists){
                return res.status(400).json({ error: 'Username already exists.'})
            }
    
            //Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            //Create and save new user with hashed password
            const user = new User({
                username: username,
                password: hashedPassword,
            })
            await user.save()
            res.status(201).json({ message: 'New user created successfully.'})
        } catch(error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
];

// Login controller
exports.login = [
    //Validate and sanitize input fields
    body('username')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Please provide your username.'),
    body('password')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Please provide your password.'), 

    async (req, res) => {
        const {username, password} = req.body;

        try{
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                console.log(errors)
                return res.status(400).json({ error: errors.array() })
            }

            // Find user in database
            const user = await User.findOne({ username: username })

            // If user does not exist or password is incorrect, return error
            if (!user || !(await bcrypt.compare(password, user.password)) ) {
                console.log('Invalid Credentials')
                return res.status(401).json({error: 'Invalid cretentials'})
            }

            // If authentication successful, generate JWT token
            const token = jwt.sign(
                {id: user._id, username: user.username}, 
                process.env.SECRET_ACCESS_TOKEN, 
                { expiresIn: '2 days' }
            );

            // Send token as cookie
            res.cookie('token', token)
            return res.status(200).json({username: user.username, _id: user._id});

        } catch(err){
            //Handle potential database query error
            console.log(err)
            res.status(500).json({ error: 'Internal server error. Login unsuccessfull'})
        }
    }
];

exports.test = async (req, res) => {
    res.status(200).json({success: true, msg: 'You are authorized'})
}