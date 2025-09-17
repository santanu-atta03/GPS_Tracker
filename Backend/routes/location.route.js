import express from "express";
import { createBusId, getAllBus, getBusByDeviceId, getBusesAlongRoute, getLocation, updateBusLocation, updatelocation } from "../controllers/Location.controller.js";
 
const locationRoute = express.Router();

locationRoute.put("/update/location",updatelocation)
locationRoute.post("/create/newBus",createBusId)
locationRoute.get("/get/location/:deviceID",getLocation)
locationRoute.get('/get/search', getAllBus);
locationRoute.get('/route/search', getBusesAlongRoute);
locationRoute.get('/bus/:deviceId', getBusByDeviceId);
locationRoute.post('/bus/update', updateBusLocation);

export default locationRoute;
