import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { createDriver } from "../controllers/Driver.controller.js";
const driverRoute = express.Router()

driverRoute.post("/createUser",isAuthenticated, createDriver)

export default  driverRoute