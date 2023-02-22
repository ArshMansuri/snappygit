const User = require('../model/User');
const cloudinary = require("cloudinary")

exports.signin = async (req, res) =>{
    try {
        var myCloud = {
            public_id : '',
            secure_url : '',
            
        }
        if(req.body.avatar){
            myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder : "avatars", 
            })
        }

        const {username, email, password} = req.body;

        let user = await User.findOne({username});

        if(user){
            return res.status(400).json({
                success: false,
                message: "User alrady exist"
            })
        }

        user = await User.create({
            username,
            email,
            password,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        })

        const token = await user.createToken();
        return res.status(201).cookie("token", token)
        .json({
            success: true,
            user,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.login = async (req, res) =>{

    try {
        
        const {username, password} = req.body;
        console.log("call" + username) 

        let user = await User.findOne({username}).select("+password");

        if(!user){
            return res.status(400).json({
                success: false,
                message: "user not found"
            })
        }
        const ismatchpass = await user.matchPassword(password);

        if(!ismatchpass){
            return res.status(400).json({
                success: false,
                message: "pass wrong"
            })
        }

        const token = await user.createToken();

        return res.status(200).cookie("token", token, {httpOnly: true}).json({
            success: true,
            user,
            token
        })
    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.logout = async (req, res) =>{
    try {
        return res.status(200).cookie("token", null, {expires:new Date(Date.now())  ,httpOnly: true}).json({
        success: true,
        message: "User LogOut"
    })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.followAndUnFollow = async (req, res)=>{


    try {
        let user = await User.findById(req.params.id);

        if(!user){
            return res.status(400).json({
                success: true,
                message: "user not found"
            })
        }

        if(!(user.followors.includes(req.user._id))){ // follow user

            user.followors.push(req.user._id);

            await user.save();

            user = await User.findById(req.user._id);
            
            user.following.push(req.params.id);

            await user.save();

            return res.status(200).json({
                success: true,
                message: "User follow"
            })

        } else { // user unfollow
            let index = user.followors.indexOf(req.user._id);

            user.followors.splice(index, 1);

            await user.save();

            user = await User.findById(req.user._id);

            index = user.following.indexOf(req.params.id);

            user.following.splice(index, 1)

            await user.save();

            return res.status(200).json({
                success: true,
                message: "User Unfollow"
            })        
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updatePassWord = async (req, res) =>{
    try {

        const {oldpassword, newpassword} = req.body;
        const user = await User.findById(req.user._id).select("+password")

        if(!oldpassword || !newpassword){
            return res.status(400).json({
                success: false,
                message: "Plese Enter Detail"
            }) 
        }

        const isMatch = await user.matchPassword(oldpassword);

        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Old password wrong"
            })
        }

        user.password = newpassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Pass has been change"
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updateProfile = async (req, res)=>{
    try {

        const user = await User.findById(req.user._id);
        const {username, email} = req.body;


        const tempUser = await User.find({username: username})

        if(!tempUser){
            return res.status(401).json({
                success: false,
                message: "User name not available"
            })
        }

        
        if(username){
            user.username = username;
        }

        if(email){
            user.email = email;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.avatarUpdate = async (req, res) =>{
    try {

        const user = await User.findById(req.user._id);
        const oldAvatarId = user.avatar.public_id;
        const { result } = await cloudinary.v2.uploader.destroy(oldAvatarId)
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars'
        })

        user.avatar.public_id = myCloud.public_id;
        user.avatar.url = myCloud.secure_url;

        await user.save();

        return res.status(201).json({
            success: true,
            message: "Avatar updated"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error 
        })
    }
}

exports.ownerProfile = async (req, res)=>{
    try {
        
        const user = await User.findById(req.user._id).populate("post");

        return res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.ownerFollowers = async (req, res) =>{
    try {
        
        const user = await User.findById(req.user._id).populate("followors");
        const followers = user.followors
        return res.status(200).json({
            success: true,
            followers       
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.ownerFollowings = async (req, res) =>{
    try {
        
        const user = await User.findById(req.user._id).populate("following");
        const followings = user.following
        return res.status(200).json({
            success: true,
            followings       
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.friendProfile = async (req, res) =>{
    try {
        
        const user = await User.findById(req.params.id).populate("post followors following");
        const owner = await User.findById(req.user._id) 
        const follow = await owner.following.includes(req.params.id)

        return res.status(200).json({
            success: true,
            user, follow
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.loadUser = async (req, res)=>{
    try {
        
        const user = await User.findById(req.user._id);

        return res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.searchUser = async (req, res)=>{
    try {

        const users = await User.find({
            "$or": [
                {"username": {$regex: req.params.key}}
            ]
        })

        return res.status(200).json({
            success: true,
            users
        })
        
    } catch (error) {
         return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.friFollowers = async(req, res) =>{
    try {

        const followers = await User.findById(req.params.id).populate("followors");

        return res.status(200).json({
            success: true,
            followers: followers.followors
        })        

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.friFollowings = async(req, res) =>{
    try {

        const followings = await User.findById(req.params.id).populate("following");

        return res.status(200).json({
            success: true,
            followings: followings.following
        })        

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.suggestionUsers = async (req, res) =>{
    try {
        
        const appOwner = await User.findById("63f269d263a2393b6cdac1c7")
        let users = await User.find({followors: {$nin : req.user._id}}).limit(6);

        for(let i=0; i<users.length; i++){
            for(let j=0; j<users[i].following.length; j++){
                if(users[i].following === appOwner._id){
                    users.unshift(appOwner)
                    break;
                }
            }
        }

        return res.status(200).json({
            success: true,
            newUsers:users
        })   

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}