import { Router } from "express";
import * as projectCon from "./projects.controller.js"
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";
const projectRoutes = Router()


projectRoutes.post("/create", multerCloudFunction(allowedExtensions.Image).array("image", 9), projectCon.createProject)
projectRoutes.get("/", projectCon.getAllProjects)   
projectRoutes.get("/:id", projectCon.getProjectById)
projectRoutes.put("/:id", multerCloudFunction(allowedExtensions.Image).array("image", 9), projectCon.updateProject)
projectRoutes.delete("/:id", projectCon.deleteProject)

export default projectRoutes