import mongoose, { mongo, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String, // cloudinary url
        required: true,
    }, 
    thumbnail: {
        type: String, 
        required: true,
    },
    title: {
        type: String, 
        required: true,
    },
    description: {
        type: String, 
        required: true,
    },
    duration: {
        type: Number, // cloudinary data
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    }

}, {timestamps: true});

// we need to do this before exporting the model.
videoSchema.plugin(mongooseAggregatePaginate)
// now we can write aggregate/paginate queries also along with normal queries like insert, etc.

export const Video = mongoose.model("Video", videoSchema)