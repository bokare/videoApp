import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js" 
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken() ;
        const refreshToken = user.generateRefreshToken() ;

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerUser = asyncHandler( async (req,res)=> {

    // get user details from frontend
    const {fullname, email, username, password } = req.body
    console.log("email: ", email);


    // validation - not empty
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or : [{username},{fullname}]
    })

    if(existedUser){
        throw new ApiError(409,"User with username or email already existed")
    }

    // console.log(req.files?.avatar[0]);
    // console.log(req.files?.coverImage[0]);
    
    // check for images, check for avatar

    let avatarLocalPath ;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is must")
    }
    
    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is must")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    
    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


    
})

const loginUser = asyncHandler( async (req,res)=> {

    const{username ,email,password} = req.body ;
    console.log(password , email)

    if(!username && !email){
        throw new ApiError(400,"Username or email is required !")
    }

    const user = await User.findOne({
        $or : [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist !")
    }

    const ispasswordValid = await user.isPasswordCorrect(password)

    if(!ispasswordValid){
        throw new ApiError(401,"Password is incorrect")
    }

    const {refreshToken ,accessToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser  = await User.findById(user._id).select("-password -refreshToken"); // select all fields except -givenFields  ;

    const options = {
        httpOnly : true,  // cookies only modified by server not accesible by front end
        secure : true 
    }
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User loggedIn succesfully")
    )

})

const logoutUser = asyncHandler( async (req,res)=> {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})






export {
    registerUser ,
    loginUser,
    logoutUser
}