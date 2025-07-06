import { Router } from "express";
import * as BlogCon from "./blog.controller.js"
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";
const blogRouter = Router()



blogRouter.post("/create",multerCloudFunction(allowedExtensions.Image).array("image", 9),BlogCon.createBlog)



export default blogRouter