const pdfParse = require('pdf-parse');
const { generateInterviewReport } = require('../services/ai.services');
const interviewReportModel = require('../models/interviewReport.model');

async function generateInterviewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume PDF is required" });
        }

        const resumeText = (await new pdfParse.PDFparse(Uint8Array.from(req.file.buffer))).text();
        const selfDescription = req.body.selfDescription;
        const jobDescription = req.body.jobDescription;

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required" });
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription,
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user._id,
            resume: resumeText,
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

async function getInterviewReportController(req, res) {
    try {
        const report = await interviewReportModel.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json({ interviewReport: report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const reports = await interviewReportModel.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ interviewReports: reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportController,
    getAllInterviewReportsController,
};