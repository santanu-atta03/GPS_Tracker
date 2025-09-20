const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/Journey.controller.js');

// Journey planning endpoint
router.post('/journey-planner', journeyController.planJourney);

// Transfer points endpoint
router.get('/transfer-points', journeyController.getTransferPoints);

// Walking route endpoint
router.post('/walking-route', journeyController.getWalkingRoute);

module.exports = router;