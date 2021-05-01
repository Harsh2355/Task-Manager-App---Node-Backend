const mongoose = require('mongoose');

// Task Model
// task = { author, description, completed }

const taskSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    description: {
        type : String,
        required: true,
        trim: true,
    },
    completed: {
        type : Boolean, 
        default: false
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task