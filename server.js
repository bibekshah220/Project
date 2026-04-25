require("dotenv").config();
const app  = require('./src/app');
const connectDB = require('./src/config/database');
const { invokgeGenAI } = require('./src/services/ai.services');


connectDB();
invokgeGenAI();


app.listen(8080, () => {
  console.log('Server is running on port 8080');
});