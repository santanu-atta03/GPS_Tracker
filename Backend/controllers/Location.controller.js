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

export const getAllBus = async (req, res) => {
  const { lat, lng, radius } = req.query;

  // Validation
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "lat & lng are required parameters",
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const searchRadius = radius ? parseInt(radius) : 1000; // default 1km

  // Validate coordinates
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
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distanceFromSearch",
          maxDistance: searchRadius,
          spherical: true,
        },
      },
      {
        $sort: { lastUpdated: -1 },
      },
    ];

    const buses = await Location.aggregate(pipeline);

    // Map and format the distance from the aggregation result
    const busesWithDistance = buses.map((bus) => ({
      ...bus,
      distanceFromSearch: Math.round(bus.distanceFromSearch),
      formattedDistance:
        bus.distanceFromSearch < 1000
          ? `${Math.round(bus.distanceFromSearch)}m`
          : `${(bus.distanceFromSearch / 1000).toFixed(1)}km`,
    }));

    res.json({
      success: true,
      buses: busesWithDistance,
      metadata: {
        searchLocation: { latitude, longitude },
        radius: searchRadius,
        totalFound: busesWithDistance.length,
        searchTime: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error in getAllBus:", err);
    res.status(500).json({
      success: false,
      message: "Server error while searching for buses",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// export const getAllBus = async (req, res) => {
//   const { lat, lng, radius } = req.query;
  
//   // Validation
//   if (!lat || !lng) {
//     return res.status(400).json({ 
//       success: false,
//       message: "lat & lng are required parameters" 
//     });
//   }

//   const latitude = parseFloat(lat);
//   const longitude = parseFloat(lng);
//   const searchRadius = radius ? parseInt(radius) : 1000; // default 1km

//   // Validate coordinates
//   if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid coordinates provided"
//     });
//   }

//   try {
//     const buses = await Location.find({
//       location: {
//         $near: {
//           $geometry: { 
//             type: "Point", 
//             coordinates: [longitude, latitude] // Note: GeoJSON uses [lng, lat]
//           },
//           $maxDistance: searchRadius,
//         },
//       },
//     }).sort({ lastUpdated: -1 }); // Sort by most recent updates first

//     // Calculate distance for each bus
//     const busesWithDistance = buses.map(bus => {
//       const busLng = bus.location.coordinates[0];
//       const busLat = bus.location.coordinates[1];
//       const distance = calculateDistance(latitude, longitude, busLat, busLng);
      
//       return {
//         ...bus.toJSON(),
//         distanceFromSearch: Math.round(distance),
//         formattedDistance: distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`
//       };
//     });

//     res.json({
//       success: true,
//       buses: busesWithDistance,
//       metadata: {
//         searchLocation: { latitude, longitude },
//         radius: searchRadius,
//         totalFound: busesWithDistance.length,
//         searchTime: new Date().toISOString()
//       }
//     });

//   } catch (err) {
//     console.error('Error in getAllBus:', err);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error while searching for buses",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

/**
 * Get buses along a route (between two points)
 */
export const getBusesAlongRoute = async (req, res) => {
  const { fromLat, fromLng, toLat, toLng, radius } = req.query;
  
  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.status(400).json({
      success: false,
      message: "fromLat, fromLng, toLat, toLng are required"
    });
  }

  const searchRadius = radius ? parseInt(radius) : 1000;
  
  try {
    // Get buses near starting point
    const fromBuses = await Location.find({
      location: {
        $near: {
          $geometry: { 
            type: "Point", 
            coordinates: [parseFloat(fromLng), parseFloat(fromLat)]
          },
          $maxDistance: searchRadius,
        },
      },
    });

    // Get buses near destination
    const toBuses = await Location.find({
      location: {
        $near: {
          $geometry: { 
            type: "Point", 
            coordinates: [parseFloat(toLng), parseFloat(toLat)]
          },
          $maxDistance: searchRadius,
        },
      },
    });

    // Find buses that appear in both searches or have routes connecting the points
    const fromBusIds = new Set(fromBuses.map(bus => bus.deviceID));
    const toBusIds = new Set(toBuses.map(bus => bus.deviceID));
    
    // Buses that pass through both areas
    const routeBuses = fromBuses.filter(bus => toBusIds.has(bus.deviceID));
    
    // Also include buses that have route points near both locations
    const additionalBuses = [...fromBuses, ...toBuses].filter(bus => {
      if (routeBuses.some(rb => rb.deviceID === bus.deviceID)) return false;
      return hasRouteNearPoints(bus, {
        from: { lat: parseFloat(fromLat), lng: parseFloat(fromLng) },
        to: { lat: parseFloat(toLat), lng: parseFloat(toLng) }
      }, searchRadius);
    });

    const allRouteBuses = [...routeBuses, ...additionalBuses];
    
    // Remove duplicates and add route analysis
    const uniqueBuses = [];
    const seenIds = new Set();
    
    allRouteBuses.forEach(bus => {
      if (!seenIds.has(bus.deviceID)) {
        seenIds.add(bus.deviceID);
        const busWithAnalysis = {
          ...bus.toJSON(),
          routeAnalysis: analyzeRouteForJourney(bus, {
            from: { lat: parseFloat(fromLat), lng: parseFloat(fromLng) },
            to: { lat: parseFloat(toLat), lng: parseFloat(toLng) }
          })
        };
        uniqueBuses.push(busWithAnalysis);
      }
    });

    // Sort by route relevance
    uniqueBuses.sort((a, b) => {
      const aScore = (a.routeAnalysis?.score || 0);
      const bScore = (b.routeAnalysis?.score || 0);
      return bScore - aScore;
    });

    res.json({
      success: true,
      buses: uniqueBuses,
      metadata: {
        fromLocation: { lat: parseFloat(fromLat), lng: parseFloat(fromLng) },
        toLocation: { lat: parseFloat(toLat), lng: parseFloat(toLng) },
        radius: searchRadius,
        fromBusesCount: fromBuses.length,
        toBusesCount: toBuses.length,
        routeBusesCount: uniqueBuses.length,
        searchTime: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('Error in getBusesAlongRoute:', err);
    res.status(500).json({
      success: false,
      message: "Server error while searching for route buses",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Get bus by device ID
 */
export const getBusByDeviceId = async (req, res) => {
  const { deviceId } = req.params;
  
  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: "Device ID is required"
    });
  }

  try {
    const bus = await Location.findOne({ deviceID: deviceId }).sort({ lastUpdated: -1 });
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus with device ID ${deviceId} not found`
      });
    }

    res.json({
      success: true,
      latestLocations: bus.toJSON(),
      metadata: {
        deviceId,
        searchTime: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('Error in getBusByDeviceId:', err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus details",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Update bus location
 */
export const updateBusLocation = async (req, res) => {
  const { deviceID, latitude, longitude, additionalData } = req.body;
  
  if (!deviceID || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: "deviceID, latitude, and longitude are required"
    });
  }

  try {
    const locationData = {
      deviceID,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      lastUpdated: new Date(),
      ...additionalData
    };

    // Also add to route history
    const routePoint = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      timestamp: new Date()
    };

    const bus = await Location.findOneAndUpdate(
      { deviceID },
      { 
        ...locationData,
        $push: { 
          route: {
            $each: [routePoint],
            $slice: -100 // Keep only last 100 route points
          }
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Bus location updated successfully",
      bus: bus.toJSON()
    });

  } catch (err) {
    console.error('Error updating bus location:', err);
    res.status(500).json({
      success: false,
      message: "Server error while updating bus location",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper Functions

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Check if bus has route points near the journey points
 */
function hasRouteNearPoints(bus, journey, threshold = 500) {
  if (!bus.route || !Array.isArray(bus.route)) return false;
  
  let nearFrom = false;
  let nearTo = false;
  
  bus.route.forEach(point => {
    if (point.coordinates && point.coordinates.length >= 2) {
      const [lng, lat] = point.coordinates;
      
      const distanceFromStart = calculateDistance(
        journey.from.lat, journey.from.lng, lat, lng
      );
      const distanceFromEnd = calculateDistance(
        journey.to.lat, journey.to.lng, lat, lng
      );
      
      if (distanceFromStart <= threshold) nearFrom = true;
      if (distanceFromEnd <= threshold) nearTo = true;
    }
  });
  
  return nearFrom && nearTo;
}

/**
 * Analyze how well a bus route matches the journey
 */
function analyzeRouteForJourney(bus, journey) {
  if (!bus.route || !Array.isArray(bus.route)) {
    return { score: 0, fromDistance: Infinity, toDistance: Infinity };
  }
  
  let minFromDistance = Infinity;
  let minToDistance = Infinity;
  let fromIndex = -1;
  let toIndex = -1;
  
  bus.route.forEach((point, index) => {
    if (point.coordinates && point.coordinates.length >= 2) {
      const [lng, lat] = point.coordinates;
      
      const distanceFromStart = calculateDistance(
        journey.from.lat, journey.from.lng, lat, lng
      );
      const distanceFromEnd = calculateDistance(
        journey.to.lat, journey.to.lng, lat, lng
      );
      
      if (distanceFromStart < minFromDistance) {
        minFromDistance = distanceFromStart;
        fromIndex = index;
      }
      if (distanceFromEnd < minToDistance) {
        minToDistance = distanceFromEnd;
        toIndex = index;
      }
    }
  });
  
  const directionScore = toIndex > fromIndex ? 1 : -0.5;
  const maxDistance = 2000;
  const fromScore = Math.max(0, (maxDistance - minFromDistance) / maxDistance);
  const toScore = Math.max(0, (maxDistance - minToDistance) / maxDistance);
  const score = (fromScore + toScore) * directionScore;
  
  return {
    score,
    fromDistance: minFromDistance,
    toDistance: minToDistance,
    fromIndex,
    toIndex,
    isCorrectDirection: directionScore > 0
  };
}