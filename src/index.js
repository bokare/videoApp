// require(dotenv).config({path : "./env"})
// import mongoose from 'mongoose' ;
// import DB_NAME from './constants.js'
import connectDB from './db/index.js';
import dotenv from 'dotenv'
import { app } from './app.js'

dotenv.config({
    path : "./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT} `);
    })
})
.catch((err)=>{
    console.log("MONGO DB Connection Error : ",err);
})
 



// connecting database Approach 2
// import express from 'express'
// const app = express() ;

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.error("ERROR :: ",error)
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT} `);
//         })

//     } catch (error) {
//         console.error("ERROR :: ",error)
//         throw error
//     }
// } )()