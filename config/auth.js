const User = require('../model/User');
const jwt = require('jsonwebtoken')

exports.isAuthor = async (req, res, next) =>{

    try {
        const {token} = req.cookies;
        
    if(!token){
        return res.status(400).json({
            success: false,
            message: "please login"
        })
    }

    const decode = await jwt.verify(token, process.env.JWT);

    req.user = await User.findById(decode._id);

    next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}