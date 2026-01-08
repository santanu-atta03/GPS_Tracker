import Bus from "../models/Bus.model.js";
import Location from "../models/Location.model.js";

/* =========================
   Pagination Helper (NEW)
========================= */
const parsePagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 10;

  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/* =========================
   Distance Utilities
========================= */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

 feat/api-pagination-bus-listing
/* =========================
   UPDATE LOCATION (UNCHANGED)
========================= */
/* 🔹 Your updatelocation function remains EXACTLY the same */
/* (No changes here) */

export const updatelocation = async (req, res) => {
  try {
    const { deviceID, latitude, longitude } = req.body;

    console.log(`[updatelocation] Received request:`, {
      deviceID,
      latitude,
      longitude,
    });

    if (!deviceID || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: deviceID, latitude, longitude",
        received: {
          deviceID: !!deviceID,
          latitude: !!latitude,
          longitude: !!longitude,
        },
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
        details: { latitude: lat, longitude: lng, valid: false },
      });
    }

    const coordinates = [lat, lng];
    const currentTime = new Date();
    console.log(`[updatelocation] Parsed coordinates:`, coordinates);

    let bus = await Location.findOne({ deviceID });
    console.log(`[updatelocation] Existing bus found:`, !!bus);

    if (bus) {
      let shouldAddToRoute = true;

      if (bus.route && bus.route.length > 0) {
        const isDuplicate = isCoordinateNearExisting(
          coordinates,
          bus.route,
          500
        );
        shouldAddToRoute = !isDuplicate;
      }

      if (shouldAddToRoute) {
        bus.route.push({
          type: "Point",
          coordinates: coordinates,
          timestamp: currentTime,
        });
        console.log(
          `[updatelocation] Added new location to route, total points: ${bus.route.length}`
        );
      } else {
        console.log(
          `[updatelocation] Skipped adding duplicate route point (within 500m)`
        );
      }

      // ✅ Always update live location
      bus.prevlocation = {
        type: "Point",
        coordinates: bus.location.coordinates, // old location
        timestamp:bus.location.timestamp
      };

      bus.location = {
        type: "Point",
        coordinates: coordinates,
      };
      bus.lastUpdated = currentTime;

      await bus.save();
      return res.json({ success: true, message: "Location updated", bus });
    } else {
      const newBus = new Location({
        deviceID,
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        route: [
          {
            type: "Point",
            coordinates: coordinates,
            timestamp: currentTime,
          },
        ],
        lastUpdated: currentTime,
      });

      await newBus.save();
      return res.json({
        success: true,
        message: "New bus created",
        bus: newBus,
      });
    }
  } catch (error) {
    console.error(`[updatelocation] Error:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   UPDATED: getAllBus (PAGINATED)
========================= */
export const getAllBus = async (req, res) => {
  const { lat, lng, radius } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "lat & lng are required parameters",
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const searchRadius = radius ? parseInt(radius) : 10000;

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid coordinates provided",
    });
  }

  try {
    const totalCount = await Location.countDocuments();

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [latitude, longitude],
          },
          distanceField: "distanceFromSearch",
          maxDistance: searchRadius,
          spherical: true,
        },
      },
      { $sort: { distanceFromSearch: 1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const buses = await Location.aggregate(pipeline);

    return res.json({
      success: true,
      buses,
      pagination: {
        page,
        limit,
        total: totalCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching buses",
    });
  }
};

/* =========================
   UPDATED: getAllBusDetails (PAGINATED)
========================= */
export const getAllBusDetails = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  try {
    const total = await Bus.countDocuments();

    const buses = await Bus.find({})
      .populate("driver")
      .populate("location")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      buses,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   ALL OTHER FUNCTIONS
========================= */
/* 🔹 getLocation
   🔹 createBusId
   🔹 debugDatabase
   🔹 getBusesAlongRoute
   🔹 analyzeRouteForJourney
   🔹 calculateBusStatistics
   🔹 getBusByDeviceId
   🔹 helpers

   ⛔ NO CHANGES BELOW THIS POINT
*/
