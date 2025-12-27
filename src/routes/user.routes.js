import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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

// secured routes

// verifyJWT is a middleware which adds "user" object inside the req object, so now, we can access the user using this information.
// after this runs, it calls next() and then next thing runs which here is logoutUser.
// like this, any number of middlewares can be created.
router.route("/logout").post(verifyJWT, logoutUser)

export default router;