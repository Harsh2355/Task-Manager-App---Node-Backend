const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router();
router.use(express.json());

const upload = multer({
    limits: {
        fileSize: 40000000,
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(JPG|jpg|JPEG|jpeg|PNG|png)$/)) {
            return cb(new Error("Please upload an image having jpg, jpeg or png extention."))
        }

        cb(undefined, true)
    }
})

// create new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        await user.save();
        const token  = await user.generateAuthToken();
        res.status(201).send({
            user,
            token,
        });
    }
    catch(error) {
        res.status(400).send(error);
    }
})

// user login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user:user,
            token
        });
    }
    catch (error) {
        res.status(400).send(error);
    }
})

// user logout
// Note: Removes the current token in use
router.post('/users/logout', auth , async (req, res) => {
    const currentToken = req.token;
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== currentToken
        })
        await req.user.save();
        res.send("Success!")
    }
    catch (error) {
        res.status(500).send()
    }
})

// logout of all accounts
// Note: empty req.user.tokens
router.post('/users/logoutAll', auth , async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save();
        res.send("Success!")
    }
    catch (error) {
        res.status(500).send()
    }
})

// get information about the logged in user
router.get('/users/me', auth , async (req, res) => {
    try{
        res.send(req.user);
    }
    catch (error) {
        res.status(500).send(error);
    }
})

// update user information
// Note: Only [name, email, age, password] can be updated
router.patch('/users/me', auth , async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password','age']
    
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })
    
    if ( !isValidOperation ) {
        return res.status(404).send({
            error:"Invalid Update",
        })
    }

    const _id = req.user._id;
    try {
        const user = req.user;
        updates.forEach((update) => {
            user[update] = req.body[update] 
        })
        await user.save();
        res.send(user);
    }
    catch (e) {
        res.status(400).send(e);
    }
})

// delete the currently logged in user
// Note: Removes req.user from that database
router.delete('/users/me', auth , async (req, res) => {
    const _id = req.user._id;
    try {
        await req.user.remove();
        
        res.send(req.user);
    }
    catch (error) {
        res.status(500).send(error);
    }
})

// logged in user to create a new avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const NewBuffer = await sharp(req.file.buffer)
        .resize(250,250)
        .png()
        .toBuffer();
    req.user.avatar = NewBuffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

// delete avatar of logged in user
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send()
    }
    catch (error) {
        res.status(500).send(error);
    }
})

// get the avatar of the logged in user
router.get('/users/:id/avatar', async (req, res) => {
     try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar);
     }
     catch (error) {
         res.status(404).send();
     }
})

module.exports = router;