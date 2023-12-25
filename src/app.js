import express from 'express' 
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express() ;
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({"limit":"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))  // for query parameters
app.use(express.static("public"))  //for static assets 
app.use(cookieParser())  // cookeParser


// import routes
import userRouter from './routes/user.route.js'

// route declaration

app.use("/apis/v1/users",userRouter)
app.get("/home",(req,res)=>{
    res.send("it is my home")
})

export {app}