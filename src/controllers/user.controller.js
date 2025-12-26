import  { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const existerUser = User.findOne({
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
    console.log(`req.files object: ${req.files}`)
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

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

export {registerUser}