// sometimes in a service folder but that doesnt matter.
// goal here is: file comes from file system (local file, in our local temp server) and we put it in cloudinary and remove from our server when successfully uploaded.

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // node js has a file system built in, we use it whenever we need to manage files.

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.COUDINARY_API_KEY,
    api_secret: process.env.COUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // if the localFilePath isnt given, we return as we dont have anything to upload.
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            // it takes local file path as first argument and then in this argument object can be passed with several options related to file upload.
            resource_type: "auto"
            // can have many more options to be read in doc.
        })
        // the above function returns an object which contains lots of info related to the file uploaded. 
        // the function awaits the above function completion and then after completion: 
        // file upload is successful

        // response url means the final url of the file in the cloudinary server where it is uploaded.
        // console.log(`file uploaded successfully ${response.url}`)
        // console.log(`CLOUDINARY RESPONSE OBJECT FOR STUDY: ${response}`)
        fs.unlinkSync(localFilePath); // local server se remove hojayegi after cloudinary upload

        return response;
    } catch (error) {
        // if there is error while upload, we need to remove the file from our local sevrer too.
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary};