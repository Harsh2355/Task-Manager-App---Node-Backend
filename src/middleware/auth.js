const jwt = require('jsonwebtoken');
const User = require('../models/user');

// auth(req, res, next) checks if the bearer token provided is valid to 
//   verify if the user is logged in or not.  
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace('Bearer ','');
        const decoded = jwt.verify(token, 'Istudyintheuniversityofwaterloo')
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token,
        })
        if ( !user ) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next()
    } catch (error) {
        res.status(401).send({
            error: "Please authenticate"
        })
    }
}

module.exports = auth;