// require('dotenv').config({path: './.env'}); // not consistent with our codebase
import dotenv from "dotenv";

// import mongoose, { Error } from 'mongoose';
// import { DB_NAME } from './constants';
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
})

// 2. ANOTHER APPROACH IS TO INITIALISE THE EXPRESS APP IN A DIFFERENT FILE AND CALL THAT FILE HERE AFTER SUCCESSFUL CONNECTION TO MONGODB DATABASE USING MONGOOSE.

// connect DB is an async function. whenever a async function is executed a promise is returned.
connectDB()
.then (() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port: ${process.env.PORT}`)
    });
})
.catch ((error) => {
    console.log(`MongoDB connectioni failed.!!!! ${error}`);
})

// when the app has successfully connected to the database
app.on("error", (error) => {
    console.log("application error")
})









/*

// 1. HERE WE SEE ONE OF THE APPROACHES TO INITIALISE THE EXPRESS APP AND CONNECT TO MONGODB DATABASE USING MONGOOSE.

// we initialise express app also in the index file itself.
import express from "express";
const app = express()



// whenever an iife is started, we use semicolon in start as a standard practice because if the previous line doesnt contain a semi-colon, it may cause errors
// here, we also use iife, because we need to call and execute the database connection function immediately.
// we make it an async function because connection with database takes time. (infact any database interaction takes time. )
;( async () => {
    // we put try-catch in any db interaction
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        // when database conection is successful but the express app isnt able to talk to the database (error is in the app)
        // this executes only once when the app has an error while talking to the database.
        // for example, if the db goes down after some time of successful connection or if the network goes down etc.
        app.on("error", (error) => {
            console.log("ERRRRR: ", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App listening on port: ${process.env.PORT}`)
        })

    }catch (error){
        console.error("ERROR: ", error)
        throw error
    }
})()

*/