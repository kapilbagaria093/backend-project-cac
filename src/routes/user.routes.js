import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"



const router = Router();

// tell a route to router where post method will be run and that port method will call registerUser controller.
// here, to handle the incoming files from the frontend (avatar and cover image), we need to add the multer middleware (upload) before the registerUser method is called.
router.route("/register").post(
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


export default router;