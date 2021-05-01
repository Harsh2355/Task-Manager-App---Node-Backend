const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// User Model
// User = { name, email, password, age, avatar, tokens }

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique:true,
        trim: true,
        lowercase:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email!")
            }
        }
    },
    password: {
        type: String,
        required:true,
        trim:true,
        minLength: 8,
        validate(value) {
            if(value.toLowerCase().includes("password") || !(/[0-9]/g.test(value))) {
                throw new Error("Incorrect Password. Please read the instructions.");
            }
        }
    },
    age: {
        type : Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error("age must be postive");
            }
        } 
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required:true,
        }
    }]
}, {
    timestamps: true
})

// this hashes the password before 'save' if the password has been 
// modified or is new
userSchema.pre('save', async function (next) {
    const user = this
    
    if ( user.isModified('password') ) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// this deletes all the tasks associated with user before 'remove'
userSchema.pre('remove', async function(req, res, next) {
    const user = this;
    await Task.deleteMany({
        author: user._id,
    })
    next()
})

// user method generates an authentication token using jwt, adds it to user.tokens
// and then returns it 
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWTKEY)
    
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

// user method converts user to an object and removes password, tokens, avatar
//    from it
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

// static function takes in email and password, and verifes if the 
// email and password is valid by searching the database.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email,
    })
     
    // user with provided email does not exist
    if (!user) {
        throw new Error("Unable to Login")
    }
    
    // compare provided password and that of the user having the 
    // provided email
    const isMatch = await bcrypt.compare(password, user.password)
    
    if ( !isMatch ) {
        throw new Error("Unable to Login")
    }

    return user;
}

// Providing the User model with  a virtual property   
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField:'author'
})

const User = mongoose.model('User', userSchema)

module.exports = User