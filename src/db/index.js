import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        // the mongoose connect gives an object that can be stored in a variable if needed.
        // the response contains info about the connection like host, port, name etc.
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MONGO DB CONNECTED!!!!!! DB HOST: ${connectionInstance.connection.host}`);
    } catch(error){
        console.log(`MONGO DB CONNECTION ERROR ${error}`)
        process.exit(1)
        // learn more about process in nodejs.
        // in the first approach (see index.js/main file) we did "throw error", which also terminated the app. 
        // here, we do process.exit(1) to terminate the app with failure code 1.
    }
}

export default connectDB;