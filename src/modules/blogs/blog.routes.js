import { Router } from "express";
import * as BlogCon from "./blog.controller.js"
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";
const blogRouter = Router()



blogRouter.post("/create",multerCloudFunction(allowedExtensions.Image).array("image", 9),BlogCon.createBlog)
blogRouter.get("/", BlogCon.getAllBlogs)
blogRouter.get("/:id", BlogCon.getBlogById)
blogRouter.put("/:id", multerCloudFunction(allowedExtensions.Image).array("image", 9), BlogCon.updateBlog)
blogRouter.delete("/:id", BlogCon.deleteBlog)



export default blogRouter