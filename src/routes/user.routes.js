import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();

// tell a route to router where post method will be run and that post method will call registerUser controller.
router.route("/register").post(
    // here, to handle the incoming files from the frontend (avatar and cover image), we need to add the multer middleware (upload) before the registerUser method is called.
    // fields when multiple files incoming. -- read docs.
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        }, 
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)
// yha pe jo url banega will be: http://localhost:8000/api/v1/users/register

router.route("/login").post(loginUser)

// secured routes --------------------------------- 

// verifyJWT is a middleware which adds "user" object inside the req object, so now, we can access the user using this information.
// after this runs, it calls next() and then next thing runs which here is logoutUser.
// like this, any number of middlewares can be created.
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// in this, params input is taken, so username is taken from the url. here, the string after colon will be passed as the required parameter
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getWatchHistory)


export default router;