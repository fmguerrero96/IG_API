const User = require('./models/user');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
require('dotenv').config();

// This function will extract jwt from cookies
var cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        //This is looking for a cookie with name 'token' on the browser cookies
        token = req.cookies['token'];
    }
    return token;
};

const options = {
    secretOrKey: process.env.SECRET_ACCESS_TOKEN,
    algorithms: ['HS256'],
};
//set extractor funciton as property in options object
options.jwtFromRequest = cookieExtractor;

passport.use(new JwtStrategy (options, async (payload, done) => {
    try {
        // Find user from payload included in jwt
        const user = await User.findById(payload.id)

        if (user) {
            // If user is found, return null for error and the user found
            return done(null, user)
        } else {
            // If no user is found, return no error but also no user
            return done(null, false)
        }
    } catch (error) {
        console.log(error)
        return done(error, false)
    }
})); 

module.exports = passport