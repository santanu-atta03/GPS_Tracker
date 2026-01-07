import Bus from "../models/Bus.model.js";
import Driver from "../models/Driver.model.js";
import Location from "../models/Location.model.js";
 

export const CreateBus = async (req, res) => {
  try {
    const { name, deviceID, to, from, timeSlots,ticketPrice } = req.body;

    if (!name || !deviceID || !to || !from || !ticketPrice|| !timeSlots?.length) {
      return res.status(400).json({
        message: "All fields including time slots are required",
        success: false,
      });
    }

    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "Login first",
        success: false,
      });
    }

    const existingBus = await Location.findOne({ deviceID });
    if (existingBus) {
      return res.status(400).json({
        message: "Bus already registered",
        success: false,
      });
    }

    // create location record
    const newBusLocation = await Location.create({ deviceID });

    // build bus details
    const busDetails = {
      name,
      deviceID,
      to,
      from,
      driver: user._id,
      location: newBusLocation._id,
      ticketprice:ticketPrice,
      timeSlots,
    };

    const newBus = await Bus.create(busDetails);

    return res.status(200).json({
      message: "Bus details created successfully",
      bus: newBus,
      location: newBusLocation,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
      success: false,
    });
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
