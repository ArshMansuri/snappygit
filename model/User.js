const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "please enter username"]
    },

    email:{
        type: String,
        required: [true, "please enter email"]
    },

    avatar:{
        public_id: String,
        url: String
    },

    password: {
        type: String,
        required: [true, "please enter password"],
        minlength: [6, "password must be at least 6 characters"],
        select: false
    },

    post:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],

    followors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    likedPost: [{
         type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }]

});

UserSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }

    next();
})

UserSchema.methods.matchPassword = async function (password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.createToken = async function (){
    return jwt.sign({_id: this._id}, process.env.JWT)
}

module.exports = mongoose.model("User", UserSchema)