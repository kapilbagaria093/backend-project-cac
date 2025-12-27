import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// middleware likhte waqt next bhi lagta hai
// here, req body has access to cookies from which tokens can be retrieved. req can access cookie because we have added cookieparser() middleware in app.js
export const verifyJWT = asyncHandler(async (req, _, next) => {
    // yahaa pe, "res" is empty, toh we can replace res with underscore also. done in a lot of production grade projects.
    try {
        // yaha pe aise scenarios bhi hoskte hai jaha pe cookies arent there, that happens in case of mobile application. in that case, custom headers are sent by the user.
        // in custom headers case, key: "Authorization", value: "Bearer <access_token>", we replace the "Bearer " with empty string because we dont need that part of the string.
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) throw new ApiError(401, "unauthorised request");
    
        // we sent a lot of info into access token (defined in user.model.js)
        // we need to decode that
        // verify method verifies and returns decoded info
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if (!user) {
            throw new ApiError(401, "invalid access token")
        }
    
        // now when we are sure that, user exists. 
        // this middleware adds a new field inside the req object which stores this user. so now, the object can be referred from this field as this contains all info about user.
        req.user = user;
    
        // this is a middleware, so next() means, ab next cheez pe move on karlo.
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
}) 
