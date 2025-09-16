import express from 'express'
import isAuthenticated from '../middleware/isAuthenticated.js'
import { CreateDriver } from '../controllers/Bus.controller.js'
const BusRoute = express.Router()
BusRoute.post("/createbus",isAuthenticated ,CreateDriver)

export default BusRoute