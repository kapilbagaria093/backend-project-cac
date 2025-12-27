import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema  = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

        // kisi bhi field ko searchable banaana hai toh index true kardo(for optimised search). (very interesting topic to go through in database)
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        // in databases, password is never stored directly, instead it is encrypted. but when user is loggin in comparing the actual password with encrypted string is a challenge, which we will loot at later.
        type: String,
        required: [true, "password is required"]
    },
    refreshToken: {
        type: String,
    }
}, {timestamps: true});

// in this, we cant use arrow function as callback function, because as we know, arrow functions dont have "this" context.
// this is a middleware, so it needs access to the "next" flag. when we are done with the execution of this middleware, the "next" flag is passed to the next middleware and that starts it's process.
userSchema.pre("save", async function(next){
    
    // so that, password is encrypted only when it is changes and not on every save in database. without this if statement, even is user changes his avatar the password would be encrypted again.
    if(!this.isModified("password")) return; //next();

    // parameters: (what to hash, how many rounds of hashing)
    this.password = await bcrypt.hash(this.password, 10);
    // next()
})

// we can also design custom methods in MONGOOSE.
// userSchema.methods.{-----}: in this objec, we can inject any number of methods of our own. 
userSchema.methods.isPasswordCorrect = async function(password){
    // methods also have access to "this" context
    // bcrypt method returns true/false
    return await bcrypt.compare(password, this.password)
}

// JWT IS A BEARER TOKEN
// WHOEVER HAS THIS TOKEN, WE SEND OUT DATA TO THEM.
// ITS LIKE A DIGITAL ID CARD.

// access and refresh token concept:
// the user needs access token whenever he needs to access services of application which require authentication. (like, file upload, etc.)
// access tokens are expired by the system in a short time for security reasons (maybe 15mins, 1 hour, 1 day, etc, depending on the system we are building). 
// after expiry of access token user needs to authenticate again so, a new access token can be generated.
// to avoid the user needing to login again and again, we also use refresh token.
// a refresh token has much longer validity than an access token (10days, 30days, 1 year, etc based on system).
// we define a endpoint which the user can hit, and on that endpoint, if the user's refresh token is same as refresh token stored in system, a new access token is generated for the user without him needing to login again.
// this is how access and refresh tokens are used in modern systems.

userSchema.methods.generateAccessToken = function(){
    // this process mostly doesnt take time, so async is not required.
    return jwt.sign(
        {
            // this is the payload for token generation. we can keep as many values as we want. for example, if we keep only username, then we can use that to get all other info from mongoDB.
            _id: this._id, // _id will be stored in mongoDB and it will access from there.
            email: this.email,
            username: this.username,
            fullname: this.fullname
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// refresh token is generated in the same way.
userSchema.methods.generateRefreshToken = function(){
    // this process mostly doesnt take time, so async is not required.
    return jwt.sign(
        {
            // system keeps refreshing again and again, so refresh token stores comparatively very less information than access tokens.
            _id: this._id,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// the user we have exported here is created by mongoose and is used for direct interaciton with database, wherever required we need to import this user.
export const User = mongoose.model("User", userSchema);