const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/Journey.controller.js');
const JourneyRoute = express.Router()
// Journey planning endpoint
JourneyRoute.post('/journey-planner', journeyController.planJourney);

// Transfer points endpoint
JourneyRoute.get('/transfer-points', journeyController.getTransferPoints);

// Walking route endpoint
JourneyRoute.post('/walking-route', journeyController.getWalkingRoute);

export default  JourneyRoute