import { blogModel } from "../../DB/models/blog.js";

import { customAlphabet } from 'nanoid'
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)



export const createBlog = async(req,res,next) => {
  try {
  console.log(req.body);
  console.log(req.file);
  // const {_id} = req.authUser
  const { title, description } = req.body


 if (!req.files || req.files.length === 0) {
      return next(new Error("Please upload at least one image for the unit", { cause: 400 }));
    }

    const customId = nanoid();
    const uploadedImages = [];

    
    for (const file of req.files) {
      const uploadResult = await imagekit.upload({
        file: file.buffer, 
        fileName: file.originalname,
        folder: `${process.env.PROJECT_FOLDER}/Blogs/${customId}`,
      });

      uploadedImages.push({
        secure_url: uploadResult.url,
        public_id: uploadResult.fileId,
      });
    }
     
        //  console.log(uploadResult);
        
        const blogObject = {
          title,
          description,
          // author:_id, 
          customId,
          Image: uploadedImages
        };
        console.log(blogObject);
        const blog = await blogModel.create(blogObject);
   
        if (!blog) {
           await destroyImage(blog.Image.public_id);
           return next(new Error('Try again later, failed to add', { cause: 400 }));
        }
    
        res.status(200).json({ message: 'Blog added successfully', blog });
      } catch (error) {
        next(new Error(`Failed to upload image: ${error.message}`, { cause: 500 }));
      }

}