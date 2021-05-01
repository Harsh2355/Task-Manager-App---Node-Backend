const express = require('express')
require('./db/mongoose');
const cors = require('cors');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express()
const port = process.env.PORT

app.use(cors());

// register route handlers
app.use(userRouter);
app.use(taskRouter);

app.use(express.json());

app.listen(3001, () => {
    console.log(`server is up on port ${port}`)
})


