import Bus from "../models/Bus.model.js";
import Driver from "../models/Driver.model.js";
import Location from "../models/Location.model.js";

export const CreateDriver = async (req, res) => {
  try {
    const { name, deviceID, to, from } = req.body;
    if (!name || !deviceID || !to || !from) {
      return res.status(400).json({
        message: " all fild are required",
        success: false,
      });
    }
    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "login first",
        success: false,
      });
    }
    const existingBus = await Location.findOne({ deviceID });
    if (existingBus) {
      return res.status(400).json({
        message: "bus already registered",
        success: false,
      });
    }

    // ✅ Correct way (no extra nesting)
    const newBusdetails = await Location.create({ deviceID });

    const busDetails = {
      name: name,
      deviceID: deviceID,
      to: to,
      from: from,
      driver: user._id,
      location: newBusdetails._id,
    };
    const newBus = await Bus.create(busDetails);
    return res.status(200).json({
      message: "bus details create success fully",
      newBus,
      newBusdetails,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllBUs = async (req, res) => {
  try {
    const allBus = await Bus.find({}).populate("driver").populate("location");

    if (!allBus || allBus.length === 0) {
      return res.status(404).json({
        message: "No bus created",
        success: false,
      });
    }
    console.log(allBus)

    // Transform each bus to match UI expectations
    const formattedBuses = allBus.map((busData) => {
      return {
        // Core identifiers
        deviceID: busData.deviceID,
        id: busData.deviceID,
        deviceId: busData.deviceID,

        // Basic info (with defaults for missing data)
        name: busData.name || `Bus ${busData.deviceID}`,
        busName: busData.busName || `Bus ${busData.deviceID}`,
        status: busData.status || "Active",

        // Location data
        location: busData.location,
        currentLocation: busData.currentLocation || "Live tracking available",
        lat: busData.location?.location.coordinates?.[0] || 0, // GeoJSON format is [lng, lat]
        lng: busData.location?.location.coordinates?.[1] || 0,
        latitude: busData.location?.location.coordinates?.[0] || 0,
        longitude: busData.location?.location.coordinates?.[1] || 0,

        // Route data
        route: busData.route || [],

        // Time data (with defaults)
        lastUpdated: busData.lastUpdated,
        timestamp: busData.lastUpdated,
        updatedAt: busData.lastUpdated,
        startTime: busData.startTime || "06:00 AM",
        expectedTime: busData.expectedTime || "Calculating...",
        destinationTime: busData.destinationTime || "08:00 PM",

        // Driver data (with defaults)
        driverName: busData.driver?.name || "Driver Available",
        driver: busData.driver?.name || "Driver Available",
        driverPhone: busData.driver?.phone || "Contact Support",

        // Additional metadata
        _id: busData._id,
        __v: busData.__v,
      };
    });

    return res.status(200).json({
      message: "All buses fetched successfully",
      success: true,
      data: formattedBuses,
    });
  } catch (error) {
    console.error("[getAllBUs] Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};
