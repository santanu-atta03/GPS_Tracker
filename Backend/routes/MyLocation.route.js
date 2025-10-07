// routes/busRoutes.js
import express from "express";
import {
  findBusByRoute,
  findByBusId,
  findByBusName,
  getBusByDeviceID,
} from "../controllers/MyLocation.controller.js";

const findBusRoute = express.Router();

findBusRoute.post("/find-bus", findBusByRoute);
findBusRoute.post("/find-bus-By-id", findByBusId);
findBusRoute.post("/find-bus-bu-name", findByBusName);
findBusRoute.get("/bus-details/:deviceID", getBusByDeviceID);
export default findBusRoute;
