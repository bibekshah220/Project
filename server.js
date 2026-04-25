require("dotenv").config();
const app  = require('./src/app');
const connectDB = require('./src/config/database');
const { invokgeGenAI } = require('./src/services/ai.services');
const { resume, jobDescription, selfDescription } = require('./src/services/temp');
const { generateInterviewReport } = require('./src/services/ai.services');


connectDB();
invokgeGenAI();
generateInterviewReport({ resume, jobDescription, selfDescription });



app.listen(8080, () => {
  console.log('Server is running on port 8080');
});