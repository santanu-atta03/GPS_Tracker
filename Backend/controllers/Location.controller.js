import Bus from "../models/Bus.model.js";
import Location from "../models/Location.model.js";

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

    // Validate coordinates
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

    const coordinates = [lat, lng]; // [latitude, longitude] format
    const currentTime = new Date();
    console.log(`[updatelocation] Parsed coordinates:`, coordinates);

    // Find bus by deviceID
    let bus = await Location.findOne({ deviceID });
    console.log(`[updatelocation] Existing bus found:`, !!bus);

    if (bus) {
      // Check if there's a significant movement (only if bus has previous location)
      let shouldAddToRoute = true;

      if (bus.location && bus.location.coordinates.length > 0) {
        const prevCoords = bus.location.coordinates;
        const distance = calculateDistance(
          prevCoords[0],
          prevCoords[1],
          lat,
          lng
        );

        console.log(
          `[updatelocation] Distance from previous location: ${distance}m`
        );

        // Only add to route if moved more than 10 meters
        shouldAddToRoute = distance > 10;
      }

      if (shouldAddToRoute) {
        // Add NEW incoming location to route
        bus.route.push({
          type: "Point",
          coordinates: coordinates,
          timestamp: currentTime,
        });
        console.log(
          `[updatelocation] Added new location to route, total route points: ${bus.route.length}`
        );

        // Keep route history manageable (last 50 points)
        if (bus.route.length > 50) {
          bus.route = bus.route.slice(-50);
          console.log(`[updatelocation] Trimmed route to 50 points`);
        }
      }

      // Update current location with NEW coordinates
      bus.location = {
        type: "Point",
        coordinates: coordinates,
      };
      bus.lastUpdated = currentTime;

      await bus.save();
      logSuccess("updatelocation", "Location updated", {
        deviceID,
        coordinates,
      });
      return res.json({ success: true, message: "Location updated", bus });
    } else {
      // If new bus → create new document
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
      logSuccess("updatelocation", "New bus created", {
        deviceID,
        coordinates,
      });
      return res.json({
        success: true,
        message: "New bus created",
        bus: newBus,
      });
    }
  } catch (error) {
    logError("updatelocation", error, req.body);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllBus = async (req, res) => {
  const { lat, lng, radius } = req.query;

  console.log(`[getAllBus] Query params:`, { lat, lng, radius });

  // Validation
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "lat & lng are required parameters",
      received: { lat, lng, radius },
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const searchRadius = radius ? parseInt(radius) : 10000; // Default 10km

  console.log(`[getAllBus] Parsed values:`, {
    latitude,
    longitude,
    searchRadius,
  });

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
      details: {
        latitude,
        longitude,
        validLat: !isNaN(latitude) && latitude >= -90 && latitude <= 90,
        validLng: !isNaN(longitude) && longitude >= -180 && longitude <= 180,
      },
    });
  }

  try {
    console.log(
      `[getAllBus] Searching near ${latitude}, ${longitude} within ${searchRadius}m`
    );

    // Debug: Check if there are any buses in the database
    const totalBusCount = await Location.countDocuments();
    console.log(`[getAllBus] Total buses in database: ${totalBusCount}`);

    // Debug: Get a sample of buses to check their coordinates
    const sampleBuses = await Location.find({}).limit(3);
    console.log(
      `[getAllBus] Sample bus locations:`,
      sampleBuses.map((bus) => ({
        deviceID: bus.deviceID,
        coordinates: bus.location?.coordinates,
        hasLocation: !!bus.location,
      }))
    );

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
        $addFields: {
          formattedDistance: {
            $cond: {
              if: { $lt: ["$distanceFromSearch", 1000] },
              then: {
                $concat: [
                  { $toString: { $round: "$distanceFromSearch" } },
                  "m",
                ],
              },
              else: {
                $concat: [
                  {
                    $toString: {
                      $round: [{ $divide: ["$distanceFromSearch", 1000] }, 1],
                    },
                  },
                  "km",
                ],
              },
            },
          },
        },
      },
      { $sort: { distanceFromSearch: 1 } },
      { $limit: 100 },
    ];

    console.log(`[getAllBus] Running aggregation pipeline...`);
    const buses = await Location.aggregate(pipeline);
    console.log(`[getAllBus] Aggregation returned ${buses.length} buses`);

    // Debug: Log distances of found buses
    buses.slice(0, 5).forEach((bus) => {
      console.log(
        `[getAllBus] Bus ${bus.deviceID}: ${Math.round(
          bus.distanceFromSearch
        )}m away`
      );
    });

    // Format the results
    const busesWithDistance = buses.map((bus) => ({
      ...bus,
      distanceFromSearch: Math.round(bus.distanceFromSearch),
      hasRoute: bus.route && bus.route.length > 0,
      routePoints: bus.route ? bus.route.length : 0,
      // Add mock driver and timing data
      driverName: bus.driverName || "Driver Available",
      driverPhone: bus.driverPhone || "+91-9876543210",
      startTime: bus.startTime || "06:00 AM",
      expectedTime: bus.expectedTime || "Calculating...",
      destinationTime: bus.destinationTime || "08:00 PM",
      status: bus.status || "Active",
    }));

    logSuccess("getAllBus", `Found ${busesWithDistance.length} buses`, {
      latitude,
      longitude,
      searchRadius,
    });

    res.json({
      success: true,
      buses: busesWithDistance,
      metadata: {
        searchLocation: { latitude, longitude },
        radius: searchRadius,
        totalFound: busesWithDistance.length,
        totalInDatabase: totalBusCount,
        searchTime: new Date().toISOString(),
      },
      debug: {
        coordinates: [longitude, latitude],
        sampleLocations: sampleBuses
          .map((b) => b.location?.coordinates)
          .filter(Boolean),
      },
    });
  } catch (err) {
    logError("getAllBus", err, { latitude, longitude, searchRadius });

    // Enhanced error response
    res.status(500).json({
      success: false,
      message: "Server error while searching for buses",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              searchParams: { latitude, longitude, searchRadius },
              errorType: err.name,
              mongoError: err.code,
            }
          : undefined,
    });
  }
};

// ADDED: New debug endpoint to check database state
export const debugDatabase = async (req, res) => {
  try {
    const stats = {
      totalBuses: await Location.countDocuments(),
      busesWithLocation: await Location.countDocuments({
        location: { $exists: true },
      }),
      busesWithRoute: await Location.countDocuments({
        "route.0": { $exists: true },
      }),
      sampleBuses: await Location.find({})
        .limit(5)
        .select("deviceID location route"),
    };

    // Check indexes
    const indexes = await Location.collection.getIndexes();

    res.json({
      success: true,
      debug: {
        ...stats,
        indexes: Object.keys(indexes),
        hasGeoIndex: Object.keys(indexes).some((key) =>
          key.includes("location")
        ),
        sampleCoordinates: stats.sampleBuses.map((bus) => ({
          deviceID: bus.deviceID,
          coordinates: bus.location?.coordinates,
          coordinateType: bus.location?.coordinates
            ? typeof bus.location.coordinates[0]
            : "none",
        })),
      },
    });
  } catch (error) {
    logError("debugDatabase", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Rest of the existing functions remain the same...
export const getLocation = async (req, res) => {
  try {
    const { deviceID } = req.params;
    console.log(`[getLocation] Looking for device: ${deviceID}`);

    if (!deviceID) {
      return res.status(404).json({
        message: "deviceID not found",
        success: false,
      });
    }
    const latestLocations = await Location.findOne({ deviceID: deviceID });

    if (!latestLocations) {
      console.log(`[getLocation] No device found for ID: ${deviceID}`);
      return res.status(400).json({
        message: "no device found",
        success: false,
      });
    }

    logSuccess("getLocation", "Device found", { deviceID });
    return res.status(200).json({
      message: "device location get successfully",
      latestLocations,
      success: true,
    });
  } catch (error) {
    logError("getLocation", error, { deviceID: req.params.deviceID });
    res.status(500).json({ error: error.message });
  }
};

export const createBusId = async (req, res) => {
  try {
    const { deviceID } = req.body;
    console.log(`[createBusId] Creating bus with ID: ${deviceID}`);

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

    const newBus = await Location.create({
      deviceID,
      route: [],
    });

    logSuccess("createBusId", "Bus created", { deviceID });
    return res.status(200).json({
      message: "bus registered successfully",
      newBus: newBus.toObject(),
      success: true,
    });
  } catch (error) {
    logError("createBusId", error, req.body);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getBusByDeviceId = async (req, res) => {
  const { deviceId } = req.params;
  console.log(`[getBusByDeviceId] Looking for device: ${deviceId}`);

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: "Device ID is required",
    });
  }

  try {
    const bus = await Location.findOne({ deviceID: deviceId }).sort({
      lastUpdated: -1,
    });

    if (!bus) {
      console.log(`[getBusByDeviceId] Bus not found: ${deviceId}`);
      return res.status(404).json({
        success: false,
        message: `Bus with device ID ${deviceId} not found`,
      });
    }

    // Add mock data for better display
    const busWithMockData = {
      ...bus.toJSON(),
      driverName: bus.driverName || "Driver Available",
      driverPhone: bus.driverPhone || "+91-9876543210",
      startTime: bus.startTime || "06:00 AM",
      expectedTime: bus.expectedTime || "Calculating...",
      destinationTime: bus.destinationTime || "08:00 PM",
      status: bus.status || "Active",
    };

    logSuccess("getBusByDeviceId", "Bus found", { deviceId });
    res.json({
      success: true,
      latestLocations: busWithMockData,
      metadata: {
        deviceId,
        searchTime: new Date().toISOString(),
      },
    });
  } catch (err) {
    logError("getBusByDeviceId", err, { deviceId });
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus details",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Helper Functions

export const getAllBusDetails = async (req, res) => {
  try {
    const buses = await Bus.find({}).populate("driver").populate("location"); // this brings full Location doc

    if (!buses || buses.length === 0) {
      return res.status(404).json({
        message: "No buses found",
        success: false,
      });
    }

    const busData = buses.map((bus) => {
      // if populated location exists
      const loc = bus.location;

      return {
        deviceID: bus.deviceID,
        from: bus.from,
        to: bus.to,
        driver: {
          id: bus.driver?._id,
          name: bus.driver?.name,
          experience: bus.driver?.driverExp,
        },
        location: loc
          ? {
              coordinates: loc.location?.coordinates || [0, 0],
              lastUpdated: loc.lastUpdated || null,
            }
          : {
              coordinates: [0, 0],
              lastUpdated: null,
            },
      };
    });

    return res.status(200).json({
      message: "All bus details found",
      success: true,
      buses: busData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Enhanced error logging
const logError = (functionName, error, context = {}) => {
  console.error(`[${functionName}] Error:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Enhanced success logging
const logSuccess = (functionName, result, context = {}) => {
  console.log(`[${functionName}] Success:`, {
    result: typeof result === "object" ? Object.keys(result) : result,
    context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * FIXED: Enhanced route search with proper coordinate handling
 */
export const getBusesAlongRoute = async (req, res) => {
  const { fromLat, fromLon, toLat, toLon, radius } = req.query;

  console.log(`[getBusesAlongRoute] Query params:`, {
    fromLat,
    fromLon,
    toLat,
    toLon,
    radius,
  });

  if (!fromLat || !fromLon || !toLat || !toLon) {
    return res.status(400).json({
      success: false,
      message: "fromLat, fromLon, toLat, toLon are required",
      received: { fromLat, fromLon, toLat, toLon, radius },
    });
  }

  const searchRadius = radius ? parseInt(radius) : 15000; // INCREASED to 15km default
  const fromLatitude = parseFloat(fromLat);
  const fromLongitude = parseFloat(fromLon);
  const toLatitude = parseFloat(toLat);
  const toLongitude = parseFloat(toLon);

  console.log(`[getBusesAlongRoute] Parsed coordinates:`, {
    from: [fromLatitude, fromLongitude],
    to: [toLatitude, toLongitude],
    radius: searchRadius,
  });

  // Validate all coordinates
  const coords = [
    { name: "fromLat", value: fromLatitude },
    { name: "fromLon", value: fromLongitude },
    { name: "toLat", value: toLatitude },
    { name: "toLon", value: toLongitude },
  ];

  const invalidCoords = coords.filter(
    (coord) =>
      isNaN(coord.value) ||
      (coord.name.includes("Lat") && (coord.value < -90 || coord.value > 90)) ||
      (coord.name.includes("Lon") && (coord.value < -180 || coord.value > 180))
  );

  if (invalidCoords.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid coordinates",
      invalidCoords: invalidCoords.map((c) => ({ [c.name]: c.value })),
    });
  }

  try {
    console.log(
      `[getBusesAlongRoute] Searching route: (${fromLat}, ${fromLon}) -> (${toLat}, ${toLon})`
    );

    // Debug: Check total buses
    const totalBuses = await Location.countDocuments();
    console.log(`[getBusesAlongRoute] Total buses in database: ${totalBuses}`);

    // FIXED: Get ALL buses first, then analyze them
    const allBuses = await Location.find({
      location: { $exists: true, $ne: null },
      "location.coordinates": { $exists: true, $ne: [] },
    }).limit(1000); // Reasonable limit

    console.log(
      `[getBusesAlongRoute] Found ${allBuses.length} buses with valid locations`
    );

    if (allBuses.length === 0) {
      return res.json({
        success: true,
        buses: [],
        metadata: {
          message: "No buses found in database with valid locations",
          fromLocation: { lat: fromLatitude, lng: fromLongitude },
          toLocation: { lat: toLatitude, lng: toLongitude },
          radius: searchRadius,
          totalInDatabase: totalBuses,
          searchTime: new Date().toISOString(),
        },
      });
    }

    // FIXED: Analyze each bus for route relevance
    const analyzedBuses = allBuses
      .map((bus) => {
        // Get bus coordinates
        console.log("[getBusesAlongRoute] lat & lon : ", bus);
        const busLat = bus.location?.coordinates?.[0];
        const busLng = bus.location?.coordinates?.[1];

        if (!busLat || !busLng) {
          console.log(
            `[getBusesAlongRoute] Bus ${bus.deviceID} has invalid coordinates:`,
            bus.location?.coordinates
          );
          return null;
        }

        // Calculate distances to route points
        const distanceFromStart = calculateDistance(
          fromLatitude,
          fromLongitude,
          busLat,
          busLng
        );
        const distanceToEnd = calculateDistance(
          toLatitude,
          toLongitude,
          busLat,
          busLng
        );

        // FIXED: Enhanced route analysis
        const routeAnalysis = analyzeRouteForJourney(bus, {
          from: { lat: fromLatitude, lng: fromLongitude },
          to: { lat: toLatitude, lng: toLongitude },
        });

        // FIXED: Better relevance scoring
        let relevanceScore = 0;
        const maxRelevantDistance = 10000; // 10km

        // Score based on proximity to route points
        const startProximityScore = Math.max(
          0,
          (maxRelevantDistance - distanceFromStart) / maxRelevantDistance
        );
        const endProximityScore = Math.max(
          0,
          (maxRelevantDistance - distanceToEnd) / maxRelevantDistance
        );

        // FIXED: Score based on being between start and end points
        const routeDistance = calculateDistance(
          fromLatitude,
          fromLongitude,
          toLatitude,
          toLongitude
        );
        const totalDistanceViaPoint = distanceFromStart + distanceToEnd;
        const detourRatio = totalDistanceViaPoint / routeDistance;

        if (detourRatio < 1.3) {
          // Bus is roughly on the direct path
          relevanceScore += 0.8;
        } else if (detourRatio < 2.0) {
          // Bus is somewhat on the path
          relevanceScore += 0.4;
        }

        // Add proximity scores
        relevanceScore +=
          Math.max(startProximityScore, endProximityScore) * 0.5;

        // Bonus for having route data
        if (routeAnalysis.routePoints && routeAnalysis.routePoints.length > 0) {
          relevanceScore += 0.2;
        }

        // Bonus for correct direction
        if (routeAnalysis.isCorrectDirection) {
          relevanceScore += 0.3;
        }

        // Bonus for passing through
        if (routeAnalysis.passesThrough) {
          relevanceScore += 0.5;
        }

        return {
          ...bus.toJSON(),
          routeAnalysis: {
            ...routeAnalysis,
            score: Math.min(1.0, relevanceScore),
          },
          routeMatch: {
            ...routeAnalysis,
            score: Math.min(1.0, relevanceScore),
          },
          distanceFromStart,
          distanceToEnd,
          distanceFromSearch: Math.min(distanceFromStart, distanceToEnd),
          routeRelevanceScore: Math.min(1.0, relevanceScore),
          detourRatio,
          // Add mock data
          driverName: bus.driverName || "Driver Available",
          driverPhone: bus.driverPhone || "+91-9876543210",
          startTime: bus.startTime || "06:00 AM",
          expectedTime: bus.expectedTime || "Calculating...",
          destinationTime: bus.destinationTime || "08:00 PM",
          status: bus.status || "Active",
        };
      })
      .filter((bus) => bus !== null);

    console.log(`[getBusesAlongRoute] Analyzed ${analyzedBuses.length} buses`);

    // FIXED: More lenient filtering for relevant buses
    const relevantBuses = analyzedBuses.filter((bus) => {
      const isNearStart = bus.distanceFromStart <= 8000; // 8km
      const isNearEnd = bus.distanceToEnd <= 8000; // 8km
      const hasDecentScore = bus.routeRelevanceScore > 0.1;
      const isOnPath = bus.detourRatio < 3.0; // Very lenient detour ratio
      const passesThrough = bus.routeAnalysis?.passesThrough;

      return (
        isNearStart || isNearEnd || hasDecentScore || isOnPath || passesThrough
      );
    });

    console.log(
      `[getBusesAlongRoute] Filtered to ${relevantBuses.length} relevant buses`
    );

    // Sort by relevance
    relevantBuses.sort((a, b) => {
      // Prioritize buses that pass through the route
      if (a.routeAnalysis?.passesThrough && !b.routeAnalysis?.passesThrough)
        return -1;
      if (!a.routeAnalysis?.passesThrough && b.routeAnalysis?.passesThrough)
        return 1;

      // Then by relevance score
      return b.routeRelevanceScore - a.routeRelevanceScore;
    });

    logSuccess(
      "getBusesAlongRoute",
      `Found ${relevantBuses.length} route buses`,
      {
        from: [fromLatitude, fromLongitude],
        to: [toLatitude, toLongitude],
      }
    );

    res.json({
      success: true,
      buses: relevantBuses.slice(0, 50), // Limit results
      metadata: {
        fromLocation: { lat: fromLatitude, lng: fromLongitude },
        toLocation: { lat: toLatitude, lng: toLongitude },
        radius: searchRadius,
        totalScanned: allBuses.length,
        routeBusesCount: relevantBuses.length,
        totalInDatabase: totalBuses,
        searchTime: new Date().toISOString(),
        searchStrategy: "enhanced_route_analysis",
      },
      debug:
        process.env.NODE_ENV === "development"
          ? {
              fromSearchCoords: [fromLongitude, fromLatitude],
              toSearchCoords: [toLongitude, toLatitude],
              routeDistance: calculateDistance(
                fromLatitude,
                fromLongitude,
                toLatitude,
                toLongitude
              ),
              analysisResults: analyzedBuses.slice(0, 3).map((bus) => ({
                deviceID: bus.deviceID,
                score: bus.routeRelevanceScore,
                distanceFromStart: Math.round(bus.distanceFromStart),
                distanceToEnd: Math.round(bus.distanceToEnd),
                detourRatio: bus.detourRatio?.toFixed(2),
                passesThrough: bus.routeAnalysis?.passesThrough,
                isCorrectDirection: bus.routeAnalysis?.isCorrectDirection,
              })),
            }
          : undefined,
    });
  } catch (err) {
    logError("getBusesAlongRoute", err, {
      fromLatitude,
      fromLongitude,
      toLatitude,
      toLongitude,
      searchRadius,
    });
    res.status(500).json({
      success: false,
      message: "Server error while searching for route buses",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * FIXED: Enhanced route analysis function
 */
function analyzeRouteForJourney(bus, journey) {
  const analysis = {
    score: 0,
    fromDistance: Infinity,
    toDistance: Infinity,
    fromIndex: -1,
    toIndex: -1,
    isCorrectDirection: false,
    passesThrough: false,
    routePoints: [],
  };

  // Get bus current location
  const busLat = bus.location?.coordinates?.[0];
  const busLng = bus.location?.coordinates?.[1];

  if (busLat && busLng) {
    analysis.fromDistance = calculateDistance(
      journey.from.lat,
      journey.from.lng,
      busLat,
      busLng
    );
    analysis.toDistance = calculateDistance(
      journey.to.lat,
      journey.to.lng,
      busLat,
      busLng
    );
  }

  // Analyze route points if available
  if (bus.route && Array.isArray(bus.route) && bus.route.length > 0) {
    let minFromDistance = analysis.fromDistance;
    let minToDistance = analysis.toDistance;
    let closestFromIndex = -1;
    let closestToIndex = -1;

    bus.route.forEach((point, index) => {
      if (
        point.coordinates &&
        Array.isArray(point.coordinates) &&
        point.coordinates.length >= 2
      ) {
        const [lat, lng] = point.coordinates;

        const distanceFromStart = calculateDistance(
          journey.from.lat,
          journey.from.lng,
          lat,
          lng
        );
        const distanceToEnd = calculateDistance(
          journey.to.lat,
          journey.to.lng,
          lat,
          lng
        );

        if (distanceFromStart < minFromDistance) {
          minFromDistance = distanceFromStart;
          closestFromIndex = index;
        }
        if (distanceToEnd < minToDistance) {
          minToDistance = distanceToEnd;
          closestToIndex = index;
        }

        analysis.routePoints.push({
          lat,
          lng,
          index,
          distanceFromStart,
          distanceToEnd,
        });
      }
    });

    if (minFromDistance < analysis.fromDistance)
      analysis.fromDistance = minFromDistance;
    if (minToDistance < analysis.toDistance)
      analysis.toDistance = minToDistance;
    analysis.fromIndex = closestFromIndex;
    analysis.toIndex = closestToIndex;

    // FIXED: More lenient threshold for passing through
    const threshold = 3000; // 3km threshold (increased)
    const nearFrom = analysis.fromDistance <= threshold;
    const nearTo = analysis.toDistance <= threshold;
    analysis.passesThrough = nearFrom && nearTo;

    // Check direction
    if (closestFromIndex >= 0 && closestToIndex >= 0) {
      analysis.isCorrectDirection = closestToIndex > closestFromIndex;
    }
  }

  return analysis;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
