const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    caption: String,


    image:{
        public_id: String,
        public_url: String
    },

    postHeight: {
        type: Number
    } ,

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createAt: {
        type: Date,
        default: Date.now
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        comment:{
            type: String,
            required: true
        }
    }],

    hastighe: {
        type: String,
        default: "#viral"
    }

})

module.exports = mongoose.model("Post", PostSchema)