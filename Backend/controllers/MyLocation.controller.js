import haversine from "haversine-distance";
import Location from "../models/Location.model.js";
import Bus from "../models/Bus.model.js";

// helper function: check if a point is within 1km of any route coordinate
const isWithin1Km = (point, routeCoords) => {
  for (const routePoint of routeCoords) {
    const dist = haversine(
      { lat: point[0], lon: point[1] },
      { lat: routePoint.coordinates[0], lon: routePoint.coordinates[1] }
    );
    if (dist <= 1000) {
      return true; // within 1 km
    }
  }
  return false;
};

export const findBusByRoute = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.body;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({
        message: "Please provide from and to coordinates",
        success: false,
      });
    }

    // fetch only IDs & routes from Location collection
    const buses = await Location.find({}, { deviceID: 1, route: 1 });

    const matchedBuses = [];

    for (const bus of buses) {
      const routePoints = bus.route;

      const fromMatch = isWithin1Km([fromLat, fromLng], routePoints);
      const toMatch = isWithin1Km([toLat, toLng], routePoints);

      if (fromMatch && toMatch) {
        // find full bus details from Bus schema using deviceID
        const allbus = await Bus.findOne({ deviceID: bus.deviceID });
        if (allbus) {
          matchedBuses.push(allbus);
        }
      }
    }

    if (matchedBuses.length === 0) {
      return res.status(404).json({
        message: "No bus found for the given route",
        success: false,
      });
    }

    return res.status(200).json({
      message: "success",
      success: true,
      allBus: matchedBuses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const findByBusId = async (req, res) => {
  try {
    const { DeviceId } = req.body;
    if (!DeviceId) {
      return res.status(404).json({
        message: "no device id i have",
      });
    }
    const allbus = await Bus.findOne({ deviceID: DeviceId });
    if (!allbus) {
      return res.status(400).json({
        message: "no bus found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "success",
      success: true,
      allbus,
    });
  } catch (error) {
    console.log(error);
  }
};

export const findByBusName = async (req, res) => {
  try {
    const { BusName } = req.body;
    if (!BusName) {
      return res.ststus(404).json({
        message: "bus name is requried",
        success: false,
      });
    }
    const allBus = await Bus.find({ name: BusName });
    return res.status(200).json({
      message: "bus get success fully",
      success: true,
      allBus,
    });
  } catch (error) {
    console.log(error);
  }
};
