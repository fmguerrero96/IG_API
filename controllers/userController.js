const User = require('../models/user');
const bcrypt = require('bcrypt');
const { body, validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");
const { model } = require('mongoose');

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
                profile_pic: '',
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

// Decode jwt
exports.decodeTokenInfo = async (req, res) => {
    const token = req.cookies.token

    if (!token) {
        //Return with unauthorized status if no token is provided
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try{
        //Decode token and respond with decoded token info
        const decodedToken = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN)
        res.json(decodedToken)
        return res.status(200)
    }catch(err){
        console.log('Error verifying token:', err);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

exports.logout = (req, res) =>  {
    // Delete the 'token' cookie and send message
    res.clearCookie('token')
    return res.status(200).json({ message: 'Logout successfull.'})
};

//Find user in db
exports.findUser = async (req, res) => {
    try{
        //decode jwt to get the user id
        const token = req.cookies.token
        const decodedToken = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN)
        const id =  decodedToken.id

        //find user in db
        const user = await User.findById(id)
            .select('username posts followers following profile_pic')
            .populate('posts', ['picture'])

        return res.json(user)
    } catch(err) {
        console.log(err)
        return res.status(404).json({ message: 'Internal server error'})
    }
};

//Find user by username
exports.findByUsername = async (req, res) => {
    const { username } = req.query;

    try {
        const user = await User.findOne({ username: new RegExp('^' + username + '$', 'i') }); // Case-insensitive search

        if (user) {
            return res.status(200).json({ _id: user._id, username: user.username });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

//Find user by _id
exports.searchUserByID = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(id)
            .select('username posts followers following')
            .populate('posts', ['picture']);
        if(user){
            //if user is found
            return res.status(200).json(user);
        } else {
            //if no user is found
            return res.status(404).json({ message: 'User not found' });
        }
    } catch {
        //Handle potential database query error
        return res.status(500).json({ message: 'Internal server error', error })
    }
};

//Check if user is followed 
exports.checkFollow = async (req, res) => {
    const loggedInUserID = req.params.loggedinID
    const userToFollowID = req.query.user

    try{
        //find user to follow and its followers
        const toFollow = await User.findById(userToFollowID)
        const followersArray = toFollow.followers

        //If logged in user is found in followers array...
        if(followersArray.includes(loggedInUserID)){
            return res.status(200).json(true)
        }

        return res.status(200).json(false)
    } catch(err){
        return res.status(500).json({ message: 'Internal server error', err})
    }
};

// Handle follow or unfollow
exports.follow = async (req, res) => {
    const loggedInUserID = req.params.loggedinID
    const userToFollowID = req.query.user

    try{
        const toFollow = await User.findById(userToFollowID)
        const followersArray = toFollow.followers

        const loggedIn = await User.findById(loggedInUserID)

        //If logged in user is found in followers array
        //Remove from array to unfollow
        if(followersArray.includes(loggedInUserID)){
            await toFollow.followers.pull(loggedInUserID)
            await toFollow.save()

            //also remove 'user to follow' from 'logged in' following array
            await loggedIn.following.pull(userToFollowID)
            await loggedIn.save()

            return res.status(200).json({msg: `User ${loggedInUserID} was removed as follower`})
        }

        //If 'logged in' user doesn't follow, add into followers array
        if(!followersArray.includes(loggedInUserID)){
            toFollow.followers.push(loggedInUserID)
            await toFollow.save()

            //also add 'user to follow' into 'logged in' following array
            loggedIn.following.push(userToFollowID)
            await loggedIn.save()

            return res.status(200).json({msg: `User ${loggedInUserID} was added as follower`})
        }

    } catch(err){
        return res.status(500).json({ message: 'Internal server error', err})
    }
};