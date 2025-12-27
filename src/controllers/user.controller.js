import  { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// lets make a new method which generates access and refresh tokens together, so we dont have to write code in middle of loginUser controller.
const generateAccessAndRefreshTokens = async (userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;

        // user.save is a function built in by mongoose. since, user object here, is created from a mongoose function findbyid, it has these methods built inside it.
        // here, we tell the save method to not validate stuff, because we are changing and saving only one field and no other fields are affected. otherwise yaha pe bhi password denaa pdega, avatar daalna pdega, and all other validations we have written.
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler( async ( req, res ) => {
    // STEPS: 
    // 1. get user details from frontend 
    // 2. validation - notEmpty, etc
    // 3. check if user already exists: check using username, email
    // 4. check for images, check for avatar
    // 5. upload image/avatar to cloudinary, check avatar upload success
    // 6. create user object - create entry in db
    // 7. remove password and refresh token field form response of user object creation.
    // 8. check for user creation (null response or user created?)
    // 9. return res

// code:
// 1. get user details from frontend 
    // data doesnt necessarily come from form or json(req.body), it may also come from url. we will look into that later.
    const { fullname, email, username, password } = req.body
    console.log("INCOMING INFO IN /register:: fn:", fullname, "em:", email, "un:", username, "pw:", password);


// 2. validation - notEmpty, etc
    // pro validation :
    if (
        [fullname, email, username, password].some( (field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, "all fields are required")
    }
    // this is the nood way
    // if (fullname === ""){
    //     throw new ApiError(400, "fullname is required", )
    // }

// 3. check if user already exists: check using username, email
    const existerUser = await User.findOne({
        // crazy "or" in object
        // username and email me se jo bhi first matching milgya woh dedega
        $or: [{ username }, { email }]
    })

    if (existerUser) {
        throw new ApiError(409, "user already exists")
    }

// 4. check for images, check for avatar
    // now we have added a middleware here, and middleware also adds information/objects inside out req object.
    // multer gives us access to req.files
    // ? because optional chaining -- google!! -- maybe aaya ho, maybe naa aaya ho
    // avatar ki first property ke andar ek object milta hai jiske andar path hota hai jahaa pe multer ne file ko upload kiya hai, in local server (humaara public wala folder)
    // console.log("req.files object:", req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;

    // here we also need to check if cover image is actually made or not warna error aata hai in testing.
    // we use a different format then there, because we arnet checking if cover image present or not later.
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar required")
    }

// 5. upload image/avatar to cloudinary, check avatar upload success
    // cloudinary utility here...
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar required 2")
    }

// 6. create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,

        // coverImage maybe ho maybe naa ho
        coverImage: coverImage?.url || "",

        email,
        password,
        username: username.toLowerCase()
    })

// 7. remove password and refresh token field form response of user object creation.
    // checking if user object in db really created
    // an extra db call but this makes it full proof
    // and here itself we can remove the password and refreshToken from the object using a method called select.
    // here, we pass a string, and -(the field we want to remove) because by default all fields are selected.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

// 8. check for user creation (null response or user created?)
    if (!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

// 9. return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Successfully Registered!!!")
    )
    
} )

const loginUser = asyncHandler( async (req, res) => {
    // STEPS:
    // 1. GET DATA FROM REQ BODY
    // 2. CHECK IF USERNAME/EMAIL EXISTS
    // 3. FIND THE USER
    // 4. CHECK PASSWORK CORRECT OR NOT FOR THAT SPECIFIC USER NAME, NEED TO DECRYPT PASSWORD AND THEN CHECK WITH USER INPUT
    // 5. GENERATE ACCESS AND REFRESH TOKENS
    // 6. SEND COOKIE

    // 1. GET DATA FROM REQ BODY
    const {username, email, password} = req.body
    
    // 2. CHECK IF USERNAME/EMAIL EXISTS
    // if (!username && !email) { // same as 
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    // 3. FIND THE USER
    const user = await User.findOne(
        { $or: [ { username }, { email } ]}
    )

    if (!user) {
        throw new ApiError(404, "user doesnt exist")
    }

    // 4. CHECK PASSWORK CORRECT OR NOT
    const isPasswordValid = await user.isPasswordCorrect(password) // boolean return
    if (!isPasswordValid) {
        throw new ApiError(404, "invalid user credentials")
    }

    // 5. GENERATE ACCESS AND REFRESH TOKENS
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    // 6. SEND COOKIE
    // in this, we need to send user object back in cookies. now, we could also return the user object we have here directly, but, that wouldnt have correct access token, since, its reference was taken before calling the function which generated and changed the refresh token in database. so it isnt updated. 
    // now we have a decision, we can either make another db call or, if making another dbcall is an expensive operation, we can update the current user itself.

    // for now we make dbcal
    const loggesInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // cookies usually are modifiable from frontend, but configuring these options make then modifiable from server only.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggesInUser, accessToken, refreshToken
        }, 
        "User Logged In Successfully")
    )

} )

const logoutUser = asyncHandler( async (req, res) => {
    // clear cookies
    // reset refresh token in db
    // the problem here is, how do we get the reference of the user.
    // we use a middleware (jaate hue milke jaana) -- auth.middleware.js
    
    // reset refresh token in db
    await User.findByIdAndUpdate(
        // pehle query btao ki find kaise krna hai
        req.user._id,
        {
            // update kya krna hai
            $set: {
                refreshToken: undefined
            }
        },
        {
            // here, we can define some properties, "new" true, means, ab jab yeh object return krega, usme nayi updated value milegi.
            new: true
        }
    )
    
    // clear cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "user logged out successfully")
    )


})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id);
    
        if (!user) {
            throw new ApiError(401, "invalid refresh token")
        }
    
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken, refreshToken: newrefreshToken
                },
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid user token")
    }
})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}