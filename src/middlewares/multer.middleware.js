// we can use either multer or express-fileupload 
import multer from "multer";

// store file into disks. (we can use memomry storage also) -- READ DOCS.
const storage = multer.diskStorage({
    // cb: callback
    // req body had all the json data and all the stuff, but it doesnt have any files, they are passed separately.
    destination: function (req, file, cb) {
        // files rakhni kaha pe hai
        cb(null, "./public/temp")
    },

    // filename kidhr rakhna hai -- can be made very advanced.
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // "-" ke baad some unique generated sequence taaki filename unique rahee or smth.
        // "file" object has lots of properties. go through. 
        // cb(null, file.fieldname + '-' + uniqueSuffix)

        // we will keep it simple for now -- originalname: jo name user ne file ka rakha hai
        cb(null, file.originalname);
    }
}) 

export const upload = multer({ storage: storage })