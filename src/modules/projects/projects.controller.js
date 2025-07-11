
import { customAlphabet } from 'nanoid'
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";
import { projectModel } from '../../DB/models/project.js';
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)



export const createProject = async(req,res,next) => {
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
        folder: `${process.env.PROJECT_FOLDER}/Projects/${customId}`,
      });

      uploadedImages.push({
        secure_url: uploadResult.url,
        public_id: uploadResult.fileId,
      });
    }
     
         
        const projectObject = { 
          title,
          description,
          customId,
          Image: uploadedImages
        };
        console.log(projectObject);
        const project = await projectModel.create(projectObject);
   
        if (!project) {
           await destroyImage(project.Image.public_id);
           return next(new Error('Try again later, failed to add', { cause: 400 }));
        }
    
        res.status(200).json({ message: 'project added successfully', project });
      } catch (error) {
        next(new Error(`Failed to upload image: ${error.message}`, { cause: 500 }));
      }

}

// READ All projects
export const getAllProjects = async (req, res, next) => {
    try {
        const projects = await projectModel.find(); // Fetch all projects

        if (!projects.length) {
            return next(new Error('No projects found', { cause: 404 }));
        }

        res.status(200).json({ message: 'projects fetched successfully', projects });
    } catch (error) {
        next(new Error(`Failed to fetch projects: ${error.message}`, { cause: 500 }));
    }
};

// READ Single project
export const getProjectById = async (req, res, next) => {
    try {
        const projectId  = req.params.id; // Assuming you're passing _id from MongoDB
      
        // If you want to use customId for retrieval instead:
        // const { customId } = req.params;
        // const project = await projectModel.findOne({ customId });

        const project = await projectModel.findById(projectId);

        if (!project) {
            return next(new Error('project not found', { cause: 404 }));
        }

        res.status(200).json({ message: 'project fetched successfully', project });
    } catch (error) {
        // Handle CastError if projectId is not a valid MongoDB ObjectId
        if (error.name === 'CastError') {
            return next(new Error('Invalid project ID format', { cause: 400 }));
        }
        next(new Error(`Failed to fetch project: ${error.message}`, { cause: 500 }));
    }
};

// UPDATE project
export const updateProject = async (req, res, next) => {
    try {
        const  projectId  = req.params.id;
        const { title, description } = req.body;
      
        // Find the project first to check if it exists and to get old images if any
        const project = await projectModel.findById(projectId);
        if (!project) {
            return next(new Error('project not found', { cause: 404 }));
        }

        
        // Handle new image uploads (if any)
        if (req.files && req.files.length > 0) {
            let updatedImages = project.Image || []; // Start with existing images
            // First, delete old images associated with the project from ImageKit
            for (const img of project.Image) {
                await destroyImage(img.public_id);
            }
            updatedImages = []; // Clear old images for replacement

            // Upload new images
            for (const file of req.files) {
                const uploadResult = await imagekit.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                    folder: `${process.env.PROJECT_FOLDER}/Projects/${project.customId}`, // Use existing customId
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

        const updatedproject = await projectModel.findByIdAndUpdate(
            projectId,
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedproject) {
            // This case should ideally not be hit if `project` was found earlier,
            // but good for robust error handling.
            return next(new Error('Failed to update project, please try again', { cause: 500 }));
        }

        res.status(200).json({ message: 'project updated successfully', project: updatedproject });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(new Error('Invalid project ID format', { cause: 400 }));
        }
        next(new Error(`Failed to update project: ${error.message}`, { cause: 500 }));
    }
};

// DELETE project
export const deleteProject = async (req, res, next) => {
    try {
        const  projectId = req.params.id;

        const project = await projectModel.findByIdAndDelete(projectId);

        if (!project) {
            return next(new Error('project not found', { cause: 404 }));
        }

        // Delete associated images from ImageKit
        if (project.Image && project.Image.length > 0) {
            for (const img of project.Image) {
                await destroyImage(img.public_id);
            }
        }

        res.status(200).json({ message: 'project deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(new Error('Invalid project ID format', { cause: 400 }));
        }
        next(new Error(`Failed to delete project: ${error.message}`, { cause: 500 }));
    }
};