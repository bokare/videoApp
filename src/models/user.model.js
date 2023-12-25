import mongoose , { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema ({
    username : {
        type: String,
        required : true,
        unique:true,
        lowercase : true,
        trim : true,
        index: true
    },
    email : {
        type: String,
        unique:true,
        required : true,
        lowercase : true,
        trim : true,
    },
    fullname : {
        type: String,
        required : true,
        index:true,
        trim : true,
    },
    avatar :{
        type : String ,  // cloudnary url
        required : true
    },
    coverImage :{
        type : String ,  // cloudnary url
    },
    watchHistory :[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true
}
)

userSchema.pre("save", async function(next){
    if(this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
    next()
})

// this methods are called on user created models or records not on model Name directly 
userSchema.methods.isPasswordCorrect  = async function(password){
   return await bcrypt.compare(password,this.password)  // here this keyword refers to individual record or model on which this method is called ;
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        _id:this.id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRETS,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        _id:this.id,
    },
    process.env.REFRESH_TOKEN_SECRETS,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}


export const User = mongoose.model("User",userSchema)