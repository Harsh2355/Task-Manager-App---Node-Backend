const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()

const user1 = {
    _id: userOneId,
    name : "Mike",
    email: "mike@gmail.com",
    password: "abcdef21",
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWTKEY)
    }]
}

const user2 = {
    _id: userTwoId,
    name : "Scott",
    email: "scott@gmail.com",
    password: "ivycgy745h",
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWTKEY)
    }]
}

const tasks1 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First Task',
    completed: false,
    author: user1._id
}

const tasks2 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    completed: true,
    author: user1._id
}

const tasks3 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task',
    completed: false,
    author: user2._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(user1).save()
    await new User(user2).save()
    await new Task(tasks1).save()
    await new Task(tasks2).save()
    await new Task(tasks3).save()
}

module.exports = {
    userOneId,
    user1,
    setupDatabase,
    tasks1,
    tasks2,
    user2,
    tasks3
}
