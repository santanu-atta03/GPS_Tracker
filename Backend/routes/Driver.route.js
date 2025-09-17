import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { createDriver, updateProfile, userFindByEmail } from "../controllers/Driver.controller.js";
const driverRoute = express.Router()

driverRoute.post("/createUser",isAuthenticated, createDriver)
driverRoute.get("/veryfi/email/:email",userFindByEmail)
driverRoute.put("/update/profile",isAuthenticated, updateProfile)
export default  driverRoute