import express from 'express'
import isAuthenticated from '../middleware/isAuthenticated.js'
import { CreateBus, getAllBUs } from '../controllers/Bus.controller.js'
import { calculateTicketPrice } from '../controllers/TecketPriceCalculator.controller.js'
const BusRoute = express.Router()
BusRoute.post("/createbus",isAuthenticated ,CreateBus)
BusRoute.get("/get/allBus",getAllBUs)
BusRoute.post("/calculate/price",calculateTicketPrice)
export default BusRoute