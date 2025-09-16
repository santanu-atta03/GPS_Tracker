import express from "express";
import { createBusId, updatelocation } from "../controllers/Location.controller.js";
 
const locationRoute = express.Router();

locationRoute.put("/update/location",updatelocation)
locationRoute.post("/create/newBus",createBusId)
export default locationRoute;
