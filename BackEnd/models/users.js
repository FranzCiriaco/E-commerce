const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter your name'],
        maxlength: [30, `Please name length is only limited to 30 characters`]
    },
    email: {
        type: String,
        required: [true, 'Please Enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please Enter your password'],
        minlength: [8, 'Password should be at least 8 characters long'],
        select: false // This field will not be returned in the response when we fetch the user
    },
    avatar: {
        public_id:{
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
    /*
    so nag lagay ako ng expire date ng token so
    kapag nagsend ng reset password token is may 
    expiration date ung token na sinend sayo 
    */
    
})

//encrypt password before saving

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next
    }
/*so ung if statement na to is para pag mag eencrypt lang ung pass if na modify or may inenter na pass ung user */
    this.password = await bcrypt.hash(this.password, 10);
})

//compare user password 
userSchema.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

//return JWT token 
userSchema.methods.getJwtToken = function (){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

module.exports = mongoose.model('User', userSchema);