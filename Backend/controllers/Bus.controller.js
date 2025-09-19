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
    const allBus = await Bus.find({})
      .populate("driver")
      .populate("location");

    if (!allBus || allBus.length === 0) {
      return res.status(404).json({
        message: "No bus created",
        success: false,
      });
    }

    // Transform response
    const formattedBuses = allBus.map((bus) => {
      const latitude = bus.location?.coordinates?.[1] || 0;
      const longitude = bus.location?.coordinates?.[0] || 0;

      return {
        id: bus.deviceID,
        deviceID: bus.deviceID,
        deviceId: bus.deviceID, // both keys as you showed
        busName: bus.name || `Bus ${bus.deviceID}`,
        name: bus.name || `Bus ${bus.deviceID}`,
        status: "Active", // static for now, can be dynamic
        currentLocation: "Live tracking available",
        destinationTime: "08:00 PM", // placeholder
        expectedTime: "Calculating...", // placeholder
        startTime: "06:00 AM", // placeholder
        driver: bus.driver ? "Driver Available" : "Driver Not Assigned",
        driverName: bus.driver?.name || "Driver Available",
        driverPhone: bus.driver?.phone || "Contact Support",
        lat: latitude,
        latitude,
        lng: longitude,
        longitude,
        location: bus.location || { type: "Point", coordinates: [0, 0] },
        route: bus.route || [],
        lastUpdated: bus.lastUpdated,
        updatedAt: bus.lastUpdated,
        timestamp: bus.lastUpdated,
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
