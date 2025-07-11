
import { customAlphabet } from 'nanoid'
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";
import { serviceModel } from '../../DB/models/service.js';
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)



export const createService = async(req,res,next) => {
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
        folder: `${process.env.PROJECT_FOLDER}/Services/${customId}`,
      });

      uploadedImages.push({
        secure_url: uploadResult.url,
        public_id: uploadResult.fileId,
      });
    }
     
         
        const serviceObject = {
          title,
          description,
          customId,
          Image: uploadedImages
        };
        console.log(serviceObject);
        const service = await serviceModel.create(serviceObject);
   
        if (!service) {
           await destroyImage(service.Image.public_id);
           return next(new Error('Try again later, failed to add', { cause: 400 }));
        }
    
        res.status(200).json({ message: 'service added successfully', service });
      } catch (error) {
        next(new Error(`Failed to upload image: ${error.message}`, { cause: 500 }));
      }

}

// READ All services
export const getAllServices = async (req, res, next) => {
    try {
        const services = await serviceModel.find(); // Fetch all services

        if (!services.length) {
            return next(new Error('No services found', { cause: 404 }));
        }

        res.status(200).json({ message: 'services fetched successfully', services });
    } catch (error) {
        next(new Error(`Failed to fetch services: ${error.message}`, { cause: 500 }));
    }
};

// READ Single service
export const getServiceById = async (req, res, next) => {
    try {
        const serviceId  = req.params.id; // Assuming you're passing _id from MongoDB
        console.log(serviceId);
        
        // If you want to use customId for retrieval instead:
        // const { customId } = req.params;
        // const service = await serviceModel.findOne({ customId });

        const service = await serviceModel.findById(serviceId);

        if (!service) {
            return next(new Error('service not found', { cause: 404 }));
        }

        res.status(200).json({ message: 'service fetched successfully', service });
    } catch (error) {
        // Handle CastError if serviceId is not a valid MongoDB ObjectId
        if (error.name === 'CastError') {
            return next(new Error('Invalid service ID format', { cause: 400 }));
        }
        next(new Error(`Failed to fetch service: ${error.message}`, { cause: 500 }));
    }
};

// UPDATE service
export const updateService = async (req, res, next) => {
    try {
        const  serviceId  = req.params.id;
        const { title, description } = req.body;
      
        // Find the service first to check if it exists and to get old images if any
        const service = await serviceModel.findById(serviceId);
        if (!service) {
            return next(new Error('service not found', { cause: 404 }));
        }

        
        // Handle new image uploads (if any)
        if (req.files && req.files.length > 0) {
            let updatedImages = service.Image || []; // Start with existing images
            // First, delete old images associated with the service from ImageKit
            for (const img of service.Image) {
                await destroyImage(img.public_id);
            }
            updatedImages = []; // Clear old images for replacement

            // Upload new images
            for (const file of req.files) {
                const uploadResult = await imagekit.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                    folder: `${process.env.PROJECT_FOLDER}/Services/${service.customId}`, // Use existing customId
                });
                updatedImages.push({
                    secure_url: uploadResult.url,
                    public_id: uploadResult.fileId,
                });
            }
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

        const updatedservice = await serviceModel.findByIdAndUpdate(
            serviceId,
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedservice) {
            // This case should ideally not be hit if `service` was found earlier,
            // but good for robust error handling.
            return next(new Error('Failed to update service, please try again', { cause: 500 }));
        }

        res.status(200).json({ message: 'service updated successfully', service: updatedservice });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(new Error('Invalid service ID format', { cause: 400 }));
        }
        next(new Error(`Failed to update service: ${error.message}`, { cause: 500 }));
    }
};

// DELETE service
export const deleteService = async (req, res, next) => {
    try {
        const  serviceId = req.params.id;

        const service = await serviceModel.findByIdAndDelete(serviceId);

        if (!service) {
            return next(new Error('service not found', { cause: 404 }));
        }

        // Delete associated images from ImageKit
        if (service.Image && service.Image.length > 0) {
            for (const img of service.Image) {
                await destroyImage(img.public_id);
            }
        }

        res.status(200).json({ message: 'service deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(new Error('Invalid service ID format', { cause: 400 }));
        }
        next(new Error(`Failed to delete service: ${error.message}`, { cause: 500 }));
    }
};