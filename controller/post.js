const Post = require('../model/Post');
const User = require('../model/User');
const cloudinary = require("cloudinary")

exports.createPost = async (req, res) =>{

    try {

        const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
            folder : "posts",
            width: 1080,
            height: req.body.postHeight,
        })


        const newPostData = {
            caption: req.body.caption,
            image:{
                public_id: myCloud.public_id,
                public_url: myCloud.secure_url
            },
            postHeight: req.body.postHeight,
            owner: req.user._id
        };
        
        const post = await Post.create(newPostData);
        
        const user = await User.findById(req.user._id);
    
        user.post.unshift(post._id)
    
        await user.save();
    
            return res.status(201).json({
            success: true,
            message: "post created"
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.likeAndUnlike = async (req, res)=>{

    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user._id)

    if(!post){
        return res.status(404).json({
            success: false,
            message: "Post Not Found"
        })
    }

    if(post.likes.includes(req.user._id)){

        let index = post.likes.indexOf(req.user._id);
        post.likes.splice(index, 1);
        await post.save();

        index = user.likedPost.indexOf(req.params.id);
        user.likedPost.splice(index, 1);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Post UnLike",
        })

    } else {

            post.likes.push(req.user._id);
            user.likedPost.push(req.params.id)

            await post.save();
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Post Like",
            })

        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deletePost = async (req, res)=>{

    try {
        console.log('heyy')
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(500).json({
                success: false,
                message: "Post Not Found"
            })
        }
        if(post.owner.toString() !== req.user._id.toString()){
            res.status(400).json({
                success: false,
                message: "It's not your post"
            })
        } else {

            await post.remove();

            const user = await User.findById(req.user._id);

            const index = user.post.indexOf(req.params.id);

            user.post.splice(index, 1);

            await user.save();

            return res.status(200).json({
                success: true,
                message: "post deleted"
            })

        }
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    
    }
}

exports.updatePost = async (req, res)=>{

    try {
        const caption = req.body.caption;

        const post = await Post.findById(req.params.id);
    
        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post Not Found"
            })
        }
    
        if(post.owner.toString() === req.user._id.toString()){
            post.caption = caption;
    
            await post.save();
    
            return res.status(200).json({
                success: true,
                message: "Caption Update",
                caption
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "It's not your post"
            })
        }    
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}


exports.pushComment = async (req, res) =>{
    try {
        
        const comment = req.body.comment;
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post Not Found"
            })
        }
    
        
        const comment_obj = {
            user: req.user._id,
            comment
        }

        for(let i=0; i<post.comments.length; i++){
            if(post.comments[i].user.toString() === req.user._id.toString()){
                post.comments.splice(i, 1);
                break;
            }
        }

            post.comments.push(comment_obj)

            await post.save();

            return res.status(200).json({
                success: true,
                comment
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteCommetUser = async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post NOt Found"
            })
        }

        for(let i=0; i<post.comments.length; i++){
            if((post.comments[i].user.toString() === req.user._id.toString() ||
            req.user._id.toString() === post.owner.toString() )){
                post.comments.splice(i, 1);
                break;
            }
        }

        await post.save();
        return res.status(200).json({
            success: true,
            message: "Comment deleted"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getFollowingUserPost = async (req, res) =>{
    try {
        
        const user = await User.findById(req.user._id)

        const tempPost = await Post.find({
            owner: {
                        $in: user.following
            }
        }).limit(7).sort({
            $natural: -1
        }).populate('owner')

        const post = []
        let x = Math.floor((Math.random() * 3) + 1);
        let y = Math.floor((Math.random() * (x+1)) + 3);
        console.log(x)
        console.log(y)
        console.log(tempPost.length)
        if(tempPost.length === 7){
            if(x === y){
                post.push(tempPost[x]);
                y = Math.floor((Math.random() * (x+2)) + 1);
            }
            else {
                post.push(tempPost[x]);
                post.push(tempPost[y]);
            }
        }
        else if((tempPost.length <= 7) && (tempPost.length >= 1)){
            post.push(tempPost[x])
        }

        console.log(post)
        return res.status(200).json({
            success: true,
            post: post
        })
        

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSinglePost = async (req, res) =>{
    try {
        const post = await Post.findById(req.params.postId).populate('owner')

        if(!post){
            return res.status(500).json({
                success: false,
                message: "Post Not Fount"
             })
        }
        
        return res.status(200).json({
            success: true,
            post
         })
    }
    catch (error) {
        return res.status(500).json({
                success: false,
                message: error.message
        })
    }
}


exports.getAllComment = async (req, res) =>{
    try {
        
        const post = await Post.findById(req.params.id).populate("comments.user owner");
        const comments = post.comments;
        const caption = post.caption
        const owner = post.owner._id
        const ownerName = post.owner.username
        const ownerImage = post.owner.avatar.url

        return res.status(200).json({
            success: true,
            comments: comments.reverse(),
            caption,
            owner,
            ownerName,
            ownerImage
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllLike = async (req, res) =>{
    try {
        
        const post = await Post.findById(req.params.id).populate("likes");
        const likes = post.likes;

        return res.status(200).json({
            success: true,
            likes: likes.reverse()
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllLikeId = async (req, res) =>{
    try {
        
        const post = await Post.findById(req.params.id);
        const likeIds = post.likes;

        // const index = likeIds.indexOf(req.user._id);
        // if(index !== -1){
        //     return res.status(200).json({
        //         success: true,
        //         postLiked: true
        //     })
        // }

        return res.status(200).json({
            success: true,
            postLiked: likeIds
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllLikedPost = async (req, res)=>{
    try {

        const user = await User.findById(req.user._id)
        const likedPost = user.likedPost

        return res.status(200).json({
            success: true,
            likedPost
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getExplorePost = async (req, res)=>{
    try {

        const skip = req.params.skip;
        const posts = await Post.find({"hastighe": {$eq: "#viral"}}).skip(skip).limit(2).populate("owner")
        console.log(posts)

        return res.status(200).json({
            success: true,
            posts
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


