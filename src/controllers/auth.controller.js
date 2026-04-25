const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');


/**
 * @name registerUserController
 * @description register a new user, expacts username, email and password in the request body
 * @access Public
 */

async function registerUserController(req, res) {
    const {username, email, password} = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({message: 'Please provide username, email and password'});
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if(trimmedUsername.length < 3) {
        return res.status(400).json({message: 'Username must be at least 3 characters'});
    }

    if(!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        return res.status(400).json({message: 'Username can only contain letters, numbers, and underscores'});
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({message: 'Please provide a valid email address'});
    }

    if(password.length < 8) {
        return res.status(400).json({message: 'Password must be at least 8 characters'});
    }

    const isUserAlreadyExist = await userModel.findOne({
        $or: [
            {username: trimmedUsername},
            {email: trimmedEmail}
        ]   
    })  

    if(isUserAlreadyExist) {
        return res.status(400).json({message: 'Account already exists with this username or email'});
    }

const hash = await bcrypt.hash(password, 10);
const user = await userModel.create({
    username: trimmedUsername,
    email: trimmedEmail,
    password: hash
});

const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

res.cookie('token', token);


res.status(201).json({
    message: 'User registered successfully',
     user:{
        id: user._id,
        username: user.username,
        email: user.email
     }
    
    
    });
}


/**
 * @name loginUserController
 * @description login a user, expacts email and password in the request body
 * @access Public
 */

async function loginUserController(req, res) {
    const {email, password} = req.body;
    const user = await userModel.findOne({email});

    if(!user) {
        return res.status(400).json({message: 'Invalid email or password'});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(400).json({message: 'Invalid email or password'});
    }

    const token = jwt.sign({id: user._id ,username: user.username}, process.env.JWT_SECRET, {expiresIn: '1d'});  

    res.cookie('token', token);

    res.status(200).json({
        message: 'User logged in successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

async function logoutUserController(req, res) {
    const token = req.cookies.token;
    if (token) {
        await tokenBlacklistModel.create({ token });
    }
    res.clearCookie('token');
    res.status(200).json({ message: 'User logged out successfully' });
}


/**
 * @name getMeController
 * @description get user details of logged in user, requires token in cookies
 * @access Private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };