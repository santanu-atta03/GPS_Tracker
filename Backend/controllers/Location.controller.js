import Location from "../models/Location.model.js";

export const updatelocation = async (req, res) => {
  try {
    const { deviceID, latitude, longitude } = req.body;

    if (!deviceID || !latitude || !longitude) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

 
    const coordinates = [latitude ,longitude];  
 

    // Find bus by deviceID
    let bus = await Location.findOne({ deviceID });

    if (bus) {
      // Push previous location into route
      if (bus.location && bus.location.coordinates.length > 0) {
        bus.route.push(bus.location);
      }

      // Update current location
      bus.location = { type: "Point", coordinates };
      bus.lastUpdated = Date.now();

      await bus.save();
      return res.json({ success: true, message: "Location updated", bus });
    } else {
      // If new bus → create new document
      const newBus = new Location({
        deviceID,
        location: { type: "Point", coordinates },
      });
      await newBus.save();
      return res.json({
        success: true,
        message: "New bus created",
        bus: newBus,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLocation = async (req, res) => {
  try {
    const {deviceID} = req.params;
    if (!deviceID) {
      return res.status(404).json({
        message: "deviceID not found",
        success: false,
      });
    }
    const latestLocations = await Location.findOne({ deviceID: deviceID });

    if (!latestLocations) {
      return res.status(400).json({
        message: "no device found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "device location get successfully",
      latestLocations,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const createBusId = async (req, res) => {
  try {
    const { deviceID } = req.body;

    if (!deviceID) {
      return res.status(400).json({
        message: "device id is required",
        success: false,
      });
    }

    // Check if bus already exists
    const existingBus = await Location.findOne({ deviceID });
    if (existingBus) {
      return res.status(400).json({
        message: "bus already registered",
        success: false,
      });
    }

    // ✅ Correct way (no extra nesting)
    const newBus = await Location.create({ deviceID });

    return res.status(200).json({
      message: "bus registered successfully",
      newBus: newBus.toObject(),
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
