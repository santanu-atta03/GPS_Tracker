import express from "express";
import { createBusId, getLocation, updatelocation } from "../controllers/Location.controller.js";
 
const locationRoute = express.Router();

locationRoute.put("/update/location",updatelocation)
locationRoute.post("/create/newBus",createBusId)
locationRoute.get("/get/location",getLocation)

export default locationRoute;
