const express = require('express')
const app = express()
require('./db/mongoose');
const cors = require('cors');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

app.use(cors());
app.use(express.json());

// register route handlers
app.use(userRouter);
app.use(taskRouter);

module.exports = app