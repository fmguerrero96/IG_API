const User = require('../models/user');
const bcrypt = require('bcrypt');
const { body, validationResult} = require('express-validator');

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