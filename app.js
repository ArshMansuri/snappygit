require('dotenv').config({"path": "./config/config.env"});
const express = require('express');
const app = express();
const cookiParser = require('cookie-parser');
const cloudinary = require("cloudinary")
const cors = require("cors")
const PORT = process.env.PORT || 6020



app.use(cors({origin: 'https://social-snappy.web.app'}));

const {connectDataBase} = require('./db/conn');
connectDataBase();
app.use(cookiParser());

//--------------- middleware--------------
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({extended: true}));


//---------------import router ----------
const user = require('./routes/user');
const post = require('./routes/post');


//---------------use router -------------
app.use('/api/v1', user);
app.use('/api/v1', post);

cloudinary.config({
    cloud_name: process.env.COLUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})


app.listen(PORT, ()=>{
    console.log(`App listen on port ${PORT}`);
})