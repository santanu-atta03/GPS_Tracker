import haversine from "haversine-distance";
import Location from "../models/Location.model.js";
import Bus from "../models/Bus.model.js";

// helper: check if a point is within 1km of any route coordinate
const isWithin1Km = (point, routeCoords) => {
  for (const routePoint of routeCoords) {
    const dist = haversine(
      { lat: point[0], lon: point[1] },
      { lat: routePoint.coordinates[0], lon: routePoint.coordinates[1] }
    );
    if (dist <= 1000) return true;
  }
  return false;
};

// ✅ Controller: find buses (direct + multi-hop) + matched coordinates
export const findBusByRoute = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.body;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({
        message: "Please provide from and to coordinates",
        success: false,
      });
    }

    const buses = await Location.find({}, { deviceID: 1, route: 1 });

    // Step 1: Direct buses
    const directBusIDs = [];
    for (const bus of buses) {
      const routePoints = bus.route;
      const fromMatch = isWithin1Km([fromLat, fromLng], routePoints);
      const toMatch = isWithin1Km([toLat, toLng], routePoints);
      if (fromMatch && toMatch) {
        directBusIDs.push(bus.deviceID);
      }
    }

    if (directBusIDs.length > 0) {
      const matchedBuses = await Bus.find({ deviceID: { $in: directBusIDs } });
      return res.status(200).json({
        message: "Direct route found",
        success: true,
        type: "direct",
        total: matchedBuses.length,
        buses: matchedBuses,
        pathCoordinates: [
          [parseFloat(fromLat), parseFloat(fromLng)],
          [parseFloat(toLat), parseFloat(toLng)],
        ],
      });
    }

    // Step 2: Multi-hop buses
    // Build adjacency list: stop (lat,lon) -> buses that go through it
    const stopToBuses = new Map();
    buses.forEach((bus) => {
      bus.route.forEach((p) => {
        const key = `${p.coordinates[0].toFixed(4)},${p.coordinates[1].toFixed(
          4
        )}`;
        if (!stopToBuses.has(key)) stopToBuses.set(key, []);
        stopToBuses.get(key).push(bus.deviceID);
      });
    });

    // BFS to find path of stops (and buses) from start to end
    const start = [parseFloat(fromLat), parseFloat(fromLng)];
    const end = [parseFloat(toLat), parseFloat(toLng)];

    const visited = new Set();
    const queue = [{ point: start, path: [start], busesUsed: [] }];

    let foundPath = null;

    while (queue.length > 0) {
      const { point, path, busesUsed } = queue.shift();

      // check if within 1km of destination
      const distToEnd = haversine(
        { lat: point[0], lon: point[1] },
        { lat: end[0], lon: end[1] }
      );
      if (distToEnd <= 1000) {
        foundPath = { path: [...path, end], busesUsed };
        break;
      }

      // expand neighbors
      const key = `${point[0].toFixed(4)},${point[1].toFixed(4)}`;
      if (!stopToBuses.has(key)) continue;
      if (visited.has(key)) continue;
      visited.add(key);

      for (const busID of stopToBuses.get(key)) {
        const bus = buses.find((b) => b.deviceID === busID);
        for (const p of bus.route) {
          queue.push({
            point: [p.coordinates[0], p.coordinates[1]],
            path: [...path, point],
            busesUsed: [...busesUsed, busID],
          });
        }
      }
    }

    if (!foundPath) {
      return res.status(404).json({
        message: "No direct or multi-hop bus route found",
        success: false,
      });
    }

    // Fetch bus details
    const uniqueBusIDs = [...new Set(foundPath.busesUsed)];
    const matchedBuses = await Bus.find({ deviceID: { $in: uniqueBusIDs } });

    return res.status(200).json({
      message: "Multi-hop route found",
      success: true,
      type: "multi-hop",
      busesUsed: matchedBuses,
      pathCoordinates: foundPath.path, // full A→B→C→D sequence
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
