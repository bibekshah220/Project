const pdfParse = require('pdf-parse');
const { generateInterviewReport } = require('../services/ai.services');
const interviewReportModel = require('../models/interviewReport.model');

async function generateInterviewReportController(req, res) {
    try {
        const resumeContent = (await new pdfParse.PDFparse(req.file.buffer)).text();
        const selfDescription = req.body.selfDescription;
        const jobDescription = req.body.jobDescription;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user._id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAi,
        });

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    generateInterviewReportController,
};