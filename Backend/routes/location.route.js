import express from "express";
import { createBusId, getAllBus, getLocation, updatelocation } from "../controllers/Location.controller.js";
 
const locationRoute = express.Router();

locationRoute.put("/update/location",updatelocation)
locationRoute.post("/create/newBus",createBusId)
locationRoute.get("/get/location/:deviceID",getLocation)
locationRoute.get("/get/search",getAllBus)

export default locationRoute;
