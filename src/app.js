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
app.use(cookieParser)
// -----------------------------------------------------------------------------------------------------------------------





export { app };