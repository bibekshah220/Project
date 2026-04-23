const express = require('express');

const app = express();


// required all the routes here
const authRouter = require('./routes/auth.routes');



// using all the routes here
app.use(express.json());


app.use('/api/auth', authRouter);

module.exports = app;