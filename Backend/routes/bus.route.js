import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { CreateBus, getAllBUs } from "../controllers/Bus.controller.js";
import {
  calculateTicketPrice,
  findTicketById,
  getTecket,
  veryfypament,
} from "../controllers/TecketPriceCalculator.controller.js";
const BusRoute = express.Router();
BusRoute.post("/createbus", isAuthenticated, CreateBus);
BusRoute.get("/get/allBus", getAllBUs);
BusRoute.post("/calculate/price", calculateTicketPrice);
BusRoute.post("/verify-payment", isAuthenticated, veryfypament);
BusRoute.get("/user/all-ticket", isAuthenticated, getTecket);
BusRoute.get("/get-ticket/:ticketid", isAuthenticated, findTicketById);
export default BusRoute;
