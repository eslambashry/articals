import { Router } from "express";
import * as serviceCon from "./service.controller.js"
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";
const serviceRoutes = Router()


serviceRoutes.post("/create", multerCloudFunction(allowedExtensions.Image).array("image", 9), serviceCon.createService)
serviceRoutes.get("/", serviceCon.getAllServices)   
serviceRoutes.get("/:id", serviceCon.getServiceById)
serviceRoutes.put("/:id", multerCloudFunction(allowedExtensions.Image).array("image", 9), serviceCon.updateService)
serviceRoutes.delete("/:id", serviceCon.deleteService)

export default serviceRoutes