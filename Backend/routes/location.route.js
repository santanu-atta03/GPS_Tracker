import express from "express";
import {
  createBusId,
  getAllBus,
  getAllBusDetails,
  getBusByDeviceId,
  getBusesAlongRoute,
  getLocation,
  updatelocation,
  debugDatabase,
} from "../controllers/Location.controller.js";

const locationRoute = express.Router();

/* =========================
   Helper: Standard Error Response
========================= */
const errorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

/* =========================
   Routes with Validation
========================= */

// Update bus location
locationRoute.put("/update/location", async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return errorResponse(res, 400, "Request body is required");
    }

    await updatelocation(req, res);
  } catch (error) {
    console.error("Update location error:", error);
    return errorResponse(res, 500, "Failed to update location");
  }
});

// Create new bus
locationRoute.post("/create/newBus", async (req, res) => {
  try {
    if (!req.body?.deviceID) {
      return errorResponse(res, 400, "deviceID is required");
    }

    await createBusId(req, res);
  } catch (error) {
    console.error("Create bus error:", error);
    return errorResponse(res, 500, "Failed to create new bus");
  }
});

// Get bus location by deviceID
locationRoute.get("/get/location/:deviceID", async (req, res) => {
  try {
    const { deviceID } = req.params;

    if (!deviceID) {
      return errorResponse(res, 400, "deviceID parameter is required");
    }

    await getLocation(req, res);
  } catch (error) {
    console.error("Get location error:", error);
    return errorResponse(res, 500, "Failed to fetch location");
  }
});

// Get all buses
locationRoute.get("/get/search", async (req, res) => {
  try {
    await getAllBus(req, res);
  } catch (error) {
    console.error("Get all buses error:", error);
    return errorResponse(res, 500, "Failed to fetch buses");
  }
});

// Search buses along route
locationRoute.get("/route/search", async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon } = req.query;

    if (!fromLat || !fromLon || !toLat || !toLon) {
      return errorResponse(
        res,
        400,
        "fromLat, fromLon, toLat, and toLon query parameters are required"
      );
    }

    await getBusesAlongRoute(req, res);
  } catch (error) {
    console.error("Route search error:", error);
    return errorResponse(res, 500, "Failed to search buses along route");
  }
});

// Get bus by deviceId
locationRoute.get("/bus/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return errorResponse(res, 400, "deviceId parameter is required");
    }

    await getBusByDeviceId(req, res);
  } catch (error) {
    console.error("Get bus by deviceId error:", error);
    return errorResponse(res, 500, "Failed to fetch bus details");
  }
});

// Get all location details
locationRoute.get("/AllLocation", async (req, res) => {
  try {
    await getAllBusDetails(req, res);
  } catch (error) {
    console.error("Get all locations error:", error);
    return errorResponse(res, 500, "Failed to fetch all location details");
  }
});

/* =========================
   Debug Routes (Handled Safely)
========================= */

locationRoute.get("/debug/database", async (req, res) => {
  try {
    await debugDatabase(req, res);
  } catch (error) {
    console.error("Debug database error:", error);
    return errorResponse(res, 500, "Database debug failed");
  }
});

// Create sample buses (debug)
locationRoute.post("/debug/create-sample-buses", async (req, res) => {
  try {
    const Location = (await import("../models/Location.model.js")).default;

    const sampleBuses = [
      {
        deviceID: "TEST-BUS-001",
        location: { type: "Point", coordinates: [77.209, 28.6139] },
        status: "Active",
        driverName: "Test Driver 1",
      },
      {
        deviceID: "TEST-BUS-002",
        location: { type: "Point", coordinates: [77.1025, 28.7041] },
        status: "Active",
        driverName: "Test Driver 2",
      },
    ];

    await Location.deleteMany({ deviceID: { $regex: /^TEST-BUS/ } });
    const created = await Location.insertMany(sampleBuses);

    return res.status(201).json({
      success: true,
      message: `Created ${created.length} test buses`,
    });
  } catch (error) {
    console.error("Create sample buses error:", error);
    return errorResponse(res, 500, "Failed to create sample buses");
  }
});

export default locationRoute;
