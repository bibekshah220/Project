const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();


// required all the routes here
const authRouter = require('./routes/auth.routes');



// using all the routes here
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRouter);

module.exports = app;