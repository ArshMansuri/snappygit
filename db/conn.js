const mongoose = require('mongoose')


exports.connectDataBase = () =>{
    mongoose.connect(process.env.DataBase,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log("data base connected")
    }).catch((err) =>{
        console.log("data base not connect " + err)
    })

}