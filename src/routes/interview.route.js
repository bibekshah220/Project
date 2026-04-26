const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const interviewRouter = express.Router();
const { upload } = require('../middlewares/file.middleware');

/**
 * @route POST /api/interview
 * @desc Generate  new interview report on the basis of user self-description, resume PDF and job description.
 * @access Private
 */

interviewRouter.post('/', authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController);

/**
 * @route GET /api/interview/:id
 * @desc Fetch a single interview report by ID
 * @access Private
 */
interviewRouter.get('/:id', authMiddleware.authUser, interviewController.getInterviewReportController);

module.exports = interviewRouter;