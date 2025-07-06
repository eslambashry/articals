import  { model, Schema } from "mongoose";

const blogSchema = Schema({
    title: {
        type:String,
        required:true
      },
      description: {
        type:String,
        required:true
      },
    author: {
        type: Schema.Types.ObjectId,
        // required: false,
        ref: 'User'
    },
     Image: [
        {
        secure_url:{
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        },
    }
     ],
    customId:String,
    createdAt: {
        type: Date,
        default: Date.now
    }
},{timestamps:true})

export const blogModel = model("Blog", blogSchema);