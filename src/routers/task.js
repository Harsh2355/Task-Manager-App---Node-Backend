const express = require('express');
const Task = require('../models/task');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => { 
    const task = new Task({
        ...req.body,
        author: req.user._id,
    })
    try {
        await task.save();
        res.status(201).send(task);
    }
    catch(error) {
        res.status(400).send(error);
    }
})

// /GET/users?completed=true
// /GET/users?limit=10&skip=0
// /GET/users?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => { 
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const sortBy =  req.query.sortBy.split("_");
        sort[sortBy[0]] = sortBy[1] === 'asc' ? 1 : -1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match, 
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        }).execPopulate();
        res.send(req.user.tasks);

    }
    catch(error) {
        res.status(500).send(error);
    }
})

router.get('/tasks/:id', auth, async (req, res) => { 
    const _id = req.params.id;
    try {
        const task = await Task.findOne({
            _id,
            author: req.user._id,
        }); 

        if(!task) {
            return res.status(404).send();
        }
        res.send(task);
    }
    catch(error) {
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const allowedUpdates = [ "description", "completed"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })

    if ( !isValidOperation ) {
        return res.status(404).send({
            error: "Update Invalid",
        })
    }
    
    const _id = req.params.id;
    try {
        const task = await Task.findOne({
            _id,
            author: req.user._id
        });

        if ( !task ) {
            res.status(404).send();
        } 

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        // const task = await Task.findByIdAndUpdate(_id, req.body,{new:true, runValidators:true});
        res.send(task);
    }
    catch(error) {
       res.status(400).send(error);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({
            _id,
            author: req.user._id,
        });

        if(!task) {
            res.status(404).send();
        }

        res.send(task);
    }
    catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;