import express from 'express';
import cors from "cors";

// cookie parser is needed so that we can access and update cookies on user's browser.
import cookieParser from 'cookie-parser';

const app = express();
// cors and cookie-parser are configured after the app is created.
app.use(cors({
    // we can define stuff in cors. its settings can be manipulated to determine who (frontend endpoints) can access our backend
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// 3 MAJOR CONFIGURATIONS DONE IN PROFESSIONAL BACKEND SETUP -------------------------------------------------------------
// to accept json, we can set settings like limiting the size of data.
app.use(express.json({limit: "16kb"}))
// to accept data from url we use urlencoded middleware. extended: true allows nested objects.
app.use(express.urlencoded({extended: true, limit: "16kb"}))
// static means some files that we want to be stored on our server and be publicly accessible.
app.use(express.static("public"))

// cookie parser for cookies CRUD
app.use(cookieParser())
// -----------------------------------------------------------------------------------------------------------------------



// routes import
// whatever is exported as default in user.routes.js will be imported here and used as "userRouter"
import userRouter from "./routes/user.routes.js"

// routes declaration
// in the start, we directly did "app.get" and defined routes and endpoints, because we were doing everything at same plae, by writing middlewares and controllers everything there itself. but because we have not separated stuff, we need to use this import configuration and do things systematically.

// app.use("/users", userRouter) // we can use this directly but it is standard practice to put some stuff in url like, "api", "version", etc.
// so we do:
app.use("/api/v1/users", userRouter)

// now: http://localhost:8000/api/v1/users/...{all routes related to user will be now defined in the user.routes.js as that file is given control now.}

// now, if we go to "/users", it gives the control to userRouter and ab kya krna hai is defined in userRouter file (user.routes.json).


export { app };