import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// tell a route to router where post method will be run and that port method will call registerUser controller.
router.route("/register").post(registerUser)
// yha pe jo url banega will be: http://localhost:8000/api/v1/users/register


export default router;