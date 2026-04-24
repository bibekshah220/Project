const {Router} = require('express');
const authController = require('../controllers/auth.controller');
const authmiddleware = require('../middlewares/auth.middleware');
const authRouter = Router();
/*
* @route POST /api/auth/register
* @desc Register a new user
* @access Public
*/
authRouter.post('/register', authController.registerUserController,);


/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login', authController.loginUserController,); 
 
/**
 * @route Get/api/auth/logout
 * @desc clear token from user cookies and add the token in blacklist
 * @access Public
 */
authRouter.get('/logout', authController.logoutUserController,);  

/**
 * @route Get/api/auth/getme
 * @desc get user details of logged in user, requires token in cookies  
 * @access Private
 */

authRouter.get('/getme', authmiddleware.authUser, authController.getMeController,);
module.exports = authRouter;