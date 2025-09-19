import express from 'express'
import isAuthenticated from '../middleware/isAuthenticated.js'
import { CreateDriver, getAllBUs } from '../controllers/Bus.controller.js'
const BusRoute = express.Router()
BusRoute.post("/createbus",isAuthenticated ,CreateDriver)
BusRoute.get("/get/allBus",getAllBUs)
export default BusRoute