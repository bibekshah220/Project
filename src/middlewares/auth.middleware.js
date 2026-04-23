const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

 async function authUser (req, res, next) {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({message: 'No token found, authorization denied'});
    }
    
    const isBlacklisted = await tokenBlacklistModel.findOne({token});
    if(isBlacklisted) {
        return res.status(401).json({message: 'Token is invalid, authorization denied'});
    }



    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({message: 'Invalid token, authorization denied'});
    }   }

    module.exports = { authUser }; 