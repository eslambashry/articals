import { blogModel } from "../../DB/models/blog.js";

import { customAlphabet } from 'nanoid'
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)



export const createBlog = async(req,res,next) => {
  try {
 
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
     
         
        const blogObject = {
          title,
          description,
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

// READ All Blogs
export const getAllBlogs = async (req, res, next) => {
    try {
        const blogs = await blogModel.find({}); // Fetch all blogs

        if (!blogs.length) {
            return next(new Error('No blogs found', { cause: 404 }));
        }

        res.status(200).json({ message: 'Blogs fetched successfully', blogs });
    } catch (error) {
        next(new Error(`Failed to fetch blogs: ${error.message}`, { cause: 500 }));
    }
};

// READ Single Blog
export const getBlogById = async (req, res, next) => {
    try {
        const blogId  = req.params.id; // Assuming you're passing _id from MongoDB
      console.log(blogId);
      
        // If you want to use customId for retrieval instead:
        // const { customId } = req.params;
        // const blog = await blogModel.findOne({ customId });

        const blog = await blogModel.findById(blogId);

        if (!blog) {
            return next(new Error('Blog not found', { cause: 404 }));
        }

        res.status(200).json({ message: 'Blog fetched successfully', blog });
    } catch (error) {
        // Handle CastError if blogId is not a valid MongoDB ObjectId
        if (error.name === 'CastError') {
            return next(new Error('Invalid Blog ID format', { cause: 400 }));
        }
        next(new Error(`Failed to fetch blog: ${error.message}`, { cause: 500 }));
    }
};

// UPDATE Blog
export const updateBlog = async (req, res, next) => {
    try {
        const  blogId  = req.params.id;
        const { title, description } = req.body;
      
        // Find the blog first to check if it exists and to get old images if any
        const blog = await blogModel.findById(blogId);
        if (!blog) {
            return next(new Error('Blog not found', { cause: 404 }));
        }


        // Handle new image uploads (if any)
        if (req.files && req.files.length > 0) {
        let updatedImages = blog.Image || []; // Start with existing images
            // First, delete old images associated with the blog from ImageKit
            for (const img of blog.Image) {
                await destroyImage(img.public_id);
            }
            updatedImages = []; // Clear old images for replacement

            // Upload new images
            for (const file of req.files) {
                const uploadResult = await imagekit.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                    folder: `${process.env.PROJECT_FOLDER}/Blogs/${blog.customId}`, // Use existing customId
                });
                updatedImages.push({
                    secure_url: uploadResult.url,
                    public_id: uploadResult.fileId,
                });
            }
                    // Prepare fields to update
        var updateFields = {
            ...(title && { title }), // Only add title if provided
            ...(description && { description }), // Only add description if provided
            Image: updatedImages // Always update image array (could be empty if no new images)
        };
        }

        else{
                    // Prepare fields to update
        var updateFields = {
            ...(title && { title }), // Only add title if provided
            ...(description && { description }), // Only add description if provided
        };
        }

        const updatedBlog = await blogModel.findByIdAndUpdate(
            blogId,
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedBlog) {
            // This case should ideally not be hit if `blog` was found earlier,
            // but good for robust error handling.
            return next(new Error('Failed to update blog, please try again', { cause: 500 }));
        }

        res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(new Error('Invalid Blog ID format', { cause: 400 }));
        }
        next(new Error(`Failed to update blog: ${error.message}`, { cause: 500 }));
    }
};

// DELETE Blog
export const deleteBlog = async (req, res, next) => {
    try {
        const  blogId = req.params.id;

        const blog = await blogModel.findByIdAndDelete(blogId);

        if (!blog) {
            return next(new Error('Blog not found', { cause: 404 }));
        }

        // Delete associated images from ImageKit
        if (blog.Image && blog.Image.length > 0) {
            for (const img of blog.Image) {
                await destroyImage(img.public_id);
            }
        }

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(new Error('Invalid Blog ID format', { cause: 400 }));
        }
        next(new Error(`Failed to delete blog: ${error.message}`, { cause: 500 }));
    }
};