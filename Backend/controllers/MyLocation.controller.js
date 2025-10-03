import haversine from "haversine-distance";
import Location from "../models/Location.model.js";
import Bus from "../models/Bus.model.js";
import getAddressFromCoordinates from "../utils/getAddressFromCoordinates.js";

// helper: check if a point is within 1km of any route coordinate → return index
const findNearbyIndex = (point, routeCoords) => {
  for (let i = 0; i < routeCoords.length; i++) {
    const dist = haversine(
      { lat: point[0], lon: point[1] },
      { lat: routeCoords[i].coordinates[0], lon: routeCoords[i].coordinates[1] }
    );
    if (dist <= 1000) return i;
  }
  return -1;
};

// helper: find nearest future startTime
const getNextStartTime = (timeSlots, minTime = new Date()) => {
  let nearestSlot = null;
  let minDiff = Infinity;

  timeSlots.forEach((slot) => {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const slotStartTime = new Date();
    slotStartTime.setHours(startH, startM, 0, 0);

    let diff = slotStartTime - minTime;
    if (diff < 0) diff += 24 * 60 * 60 * 1000;

    if (diff < minDiff) {
      minDiff = diff;
      nearestSlot = slot;
    }
  });

  return nearestSlot; // could be null if no slots
};

export const findBusByRoute = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.body;
    if (
      fromLat === undefined ||
      fromLng === undefined ||
      toLat === undefined ||
      toLng === undefined
    ) {
      return res.status(400).json({
        message: "Please provide from and to coordinates",
        success: false,
      });
    }

    const buses = await Location.find(
      {},
      { deviceID: 1, route: 1, location: 1, prevlocation: 1 }
    );

    // 1. Try direct route
    const directBusIDs = [];
    for (const bus of buses) {
      const routePoints = bus.route;
      const fromIndex = findNearbyIndex([fromLat, fromLng], routePoints);
      const toIndex = findNearbyIndex([toLat, toLng], routePoints);
      const prevIndex = findNearbyIndex(
        bus.prevlocation.coordinates,
        routePoints
      );
      const locIndex = findNearbyIndex(bus.location.coordinates, routePoints);

      if (
        fromIndex !== -1 &&
        toIndex !== -1 &&
        prevIndex !== -1 &&
        locIndex !== -1
      ) {
        const userDirection = fromIndex < toIndex ? "forward" : "backward";
        const busDirection = prevIndex < locIndex ? "forward" : "backward";
        if (userDirection === busDirection) {
          directBusIDs.push(bus.deviceID);
        }
      }
    }

    if (directBusIDs.length > 0) {
      let matchedBuses = await Bus.find({
        deviceID: { $in: directBusIDs },
      });
      matchedBuses = matchedBuses.map((bus) => ({
        ...bus.toObject(),
        nextStartTime: getNextStartTime(bus.timeSlots),
      }));
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

    // 2. Multi-hop: build stop → (bus, index) map
    const stopToBuses = new Map();
    buses.forEach((bus) => {
      bus.route.forEach((p, idx) => {
        const key = `${p.coordinates[0].toFixed(6)},${p.coordinates[1].toFixed(
          6
        )}`;
        if (!stopToBuses.has(key)) stopToBuses.set(key, []);
        stopToBuses.get(key).push({ busID: bus.deviceID, index: idx });
      });
    });

    const start = [parseFloat(fromLat), parseFloat(fromLng)];
    const end = [parseFloat(toLat), parseFloat(toLng)];
    const visited = new Set();

    const queue = [
      {
        point: start,
        path: [start],
        busesUsed: [],
        lastIndex: -1,
        busID: null,
      },
    ];

    let foundPath = null;

    while (queue.length > 0) {
      const { point, path, busesUsed, lastIndex, busID } = queue.shift();

      // If close enough to the end, we have a path
      const distToEnd = haversine(
        { lat: point[0], lon: point[1] },
        { lat: end[0], lon: end[1] }
      );
      if (distToEnd <= 1000) {
        foundPath = { path: [...path, end], busesUsed };
        break;
      }

      // Find stops (keys) within 1km from current point
      const nearbyStops = [];
      for (const [key, busesAtStop] of stopToBuses.entries()) {
        const [latStr, lngStr] = key.split(",");
        const stopLat = parseFloat(latStr);
        const stopLng = parseFloat(lngStr);
        const dist = haversine(
          { lat: point[0], lon: point[1] },
          { lat: stopLat, lon: stopLng }
        );
        if (dist <= 1000) {
          nearbyStops.push({ key, busesAtStop });
        }
      }

      for (const { key, busesAtStop } of nearbyStops) {
        for (const { busID: nextBusID, index } of busesAtStop) {
          const visitKey = `${nextBusID}_${index}`;
          if (visited.has(visitKey)) continue;
          visited.add(visitKey);

          const bus = buses.find((b) => b.deviceID === nextBusID);
          if (!bus) continue;

          if (busID && busID === nextBusID && index <= lastIndex) {
            // We are on same bus but would go backwards — skip
            continue;
          }

          // Enqueue further stops along this bus route
          for (let j = index + 1; j < bus.route.length; j++) {
            const p = bus.route[j];
            queue.push({
              point: [p.coordinates[0], p.coordinates[1]],
              path: [
                ...path,
                [parseFloat(p.coordinates[0]), parseFloat(p.coordinates[1])],
              ],
              busesUsed: [...busesUsed, nextBusID],
              lastIndex: j,
              busID: nextBusID,
            });
          }
        }
      }
    }

    if (!foundPath) {
      return res.status(404).json({
        message: "No direct or multi-hop bus route found",
        success: false,
      });
    }

    const uniqueBusIDs = [...new Set(foundPath.busesUsed)];
    let matchedBuses = await Bus.find({ deviceID: { $in: uniqueBusIDs } });
    let currentTime = new Date();
    matchedBuses = matchedBuses.map((bus) => {
      const slot = getNextStartTime(bus.timeSlots, currentTime);
      if (slot) {
        const [endH, endM] = slot.endTime.split(":").map(Number);
        currentTime.setHours(endH, endM, 0, 0);
      }
      return { ...bus.toObject(), nextStartTime: slot };
    });

    const pathAddresses = [];
    for (const coord of foundPath.path) {
      const address = await getAddressFromCoordinates(coord);
      pathAddresses.push({ coordinates: coord, address });
    }

    return res.status(200).json({
      message: "Multi-hop route found",
      success: true,
      type: "multi-hop",
      busesUsed: matchedBuses,
      pathCoordinates: foundPath.path,
      pathAddresses,
    });
  } catch (error) {
    console.error("Error in findBusByRoute:", error);
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
