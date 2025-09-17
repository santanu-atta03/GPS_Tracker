// import Location from "../models/Location.model.js";

// export const updatelocation = async (req, res) => {
//   try {
//     const { deviceID, latitude, longitude } = req.body;

//     if (!deviceID || !latitude || !longitude) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing fields" });
//     }

//     const coordinates = [parseFloat(longitude), parseFloat(latitude)]; // [lng, lat] for GeoJSON

//     // Find bus by deviceID
//     let bus = await Location.findOne({ deviceID });

//     if (bus) {
//       // Push previous location into route if it exists and is different
//       if (bus.location && bus.location.coordinates.length > 0) {
//         const prevCoords = bus.location.coordinates;
//         const distance = calculateDistance(
//           prevCoords[1], prevCoords[0], 
//           latitude, longitude
//         );
        
//         // Only add to route if moved more than 10 meters
//         if (distance > 10) {
//           bus.route.push({
//             type: "Point",
//             coordinates: prevCoords,
//             timestamp: bus.lastUpdated || new Date()
//           });
//         }
//       }

//       // Update current location
//       bus.location = { type: "Point", coordinates };
//       bus.lastUpdated = new Date();

//       // Keep route history manageable (last 50 points)
//       if (bus.route.length > 50) {
//         bus.route = bus.route.slice(-50);
//       }

//       await bus.save();
//       return res.json({ success: true, message: "Location updated", bus });
//     } else {
//       // If new bus → create new document
//       const newBus = new Location({
//         deviceID,
//         location: { type: "Point", coordinates },
//         route: []
//       });
//       await newBus.save();
//       return res.json({
//         success: true,
//         message: "New bus created",
//         bus: newBus,
//       });
//     }
//   } catch (error) {
//     console.error('Error updating location:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// export const getLocation = async (req, res) => {
//   try {
//     const { deviceID } = req.params;
//     if (!deviceID) {
//       return res.status(404).json({
//         message: "deviceID not found",
//         success: false,
//       });
//     }
//     const latestLocations = await Location.findOne({ deviceID: deviceID });

//     if (!latestLocations) {
//       return res.status(400).json({
//         message: "no device found",
//         success: false,
//       });
//     }
//     return res.status(200).json({
//       message: "device location get successfully",
//       latestLocations,
//       success: true,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     console.log(error);
//   }
// };

// export const createBusId = async (req, res) => {
//   try {
//     const { deviceID } = req.body;

//     if (!deviceID) {
//       return res.status(400).json({
//         message: "device id is required",
//         success: false,
//       });
//     }

//     // Check if bus already exists
//     const existingBus = await Location.findOne({ deviceID });
//     if (existingBus) {
//       return res.status(400).json({
//         message: "bus already registered",
//         success: false,
//       });
//     }

//     const newBus = await Location.create({ 
//       deviceID,
//       route: []
//     });

//     return res.status(200).json({
//       message: "bus registered successfully",
//       newBus: newBus.toObject(),
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", success: false });
//   }
// };

// export const getAllBus = async (req, res) => {
//   const { lat, lng, radius } = req.query;

//   // Validation
//   if (!lat || !lng) {
//     return res.status(400).json({
//       success: false,
//       message: "lat & lng are required parameters",
//     });
//   }

//   const latitude = parseFloat(lat);
//   const longitude = parseFloat(lng);
//   const searchRadius = radius ? parseInt(radius) : 10000; // Increased default to 10km

//   // Validate coordinates
//   if (
//     isNaN(latitude) ||
//     isNaN(longitude) ||
//     latitude < -90 ||
//     latitude > 90 ||
//     longitude < -180 ||
//     longitude > 180
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid coordinates provided",
//     });
//   }

//   try {
//     console.log(`Searching for buses near ${latitude}, ${longitude} within ${searchRadius}m`);
    
//     const pipeline = [
//       {
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates: [longitude, latitude],
//           },
//           distanceField: "distanceFromSearch",
//           maxDistance: searchRadius,
//           spherical: true,
//         },
//       },
//       {
//         $addFields: {
//           formattedDistance: {
//             $cond: {
//               if: { $lt: ["$distanceFromSearch", 1000] },
//               then: {
//                 $concat: [
//                   { $toString: { $round: "$distanceFromSearch" } },
//                   "m"
//                 ]
//               },
//               else: {
//                 $concat: [
//                   { $toString: { $round: { $divide: ["$distanceFromSearch", 100] } } },
//                   "0m"
//                 ]
//               }
//             }
//           }
//         }
//       },
//       {
//         $sort: { distanceFromSearch: 1 },
//       },
//       {
//         $limit: 100 // Limit results to prevent overload
//       }
//     ];

//     const buses = await Location.aggregate(pipeline);

//     // Format the results
//     const busesWithDistance = buses.map((bus) => ({
//       ...bus,
//       distanceFromSearch: Math.round(bus.distanceFromSearch),
//       // Add additional metadata for route analysis
//       hasRoute: bus.route && bus.route.length > 0,
//       routePoints: bus.route ? bus.route.length : 0,
//       // Add mock driver and timing data (replace with real data when available)
//       driverName: bus.driverName || "Driver Available",
//       driverPhone: bus.driverPhone || "+91-9876543210",
//       startTime: bus.startTime || "06:00 AM",
//       expectedTime: bus.expectedTime || "Calculating...",
//       destinationTime: bus.destinationTime || "08:00 PM",
//       status: bus.status || "Active"
//     }));

//     console.log(`Found ${busesWithDistance.length} buses`);

//     res.json({
//       success: true,
//       buses: busesWithDistance,
//       metadata: {
//         searchLocation: { latitude, longitude },
//         radius: searchRadius,
//         totalFound: busesWithDistance.length,
//         searchTime: new Date().toISOString(),
//       },
//     });
//   } catch (err) {
//     console.error("Error in getAllBus:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while searching for buses",
//       error: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /**
//  * Enhanced route search - finds buses that pass through or near the route
//  */
// export const getBusesAlongRoute = async (req, res) => {
//   const { fromLat, fromLng, toLat, toLng, radius } = req.query;
  
//   if (!fromLat || !fromLng || !toLat || !toLng) {
//     return res.status(400).json({
//       success: false,
//       message: "fromLat, fromLng, toLat, toLng are required"
//     });
//   }

//   const searchRadius = radius ? parseInt(radius) : 5000; // 5km default
//   const fromLatitude = parseFloat(fromLat);
//   const fromLongitude = parseFloat(fromLng);
//   const toLatitude = parseFloat(toLat);
//   const toLongitude = parseFloat(toLng);
  
//   try {
//     console.log(`Searching for buses along route: (${fromLatitude}, ${fromLongitude}) -> (${toLatitude}, ${toLongitude})`);
    
//     // Get all buses within expanded radius from both points
//     const [fromBuses, toBuses] = await Promise.all([
//       Location.aggregate([
//         {
//           $geoNear: {
//             near: {
//               type: "Point",
//               coordinates: [fromLongitude, fromLatitude]
//             },
//             distanceField: "distanceFromStart",
//             maxDistance: searchRadius,
//             spherical: true,
//           },
//         }
//       ]),
//       Location.aggregate([
//         {
//           $geoNear: {
//             near: {
//               type: "Point",
//               coordinates: [toLongitude, toLatitude]
//             },
//             distanceField: "distanceFromEnd",
//             maxDistance: searchRadius,
//             spherical: true,
//           },
//         }
//       ])
//     ]);

//     console.log(`Found ${fromBuses.length} buses near start, ${toBuses.length} near end`);

//     // Combine and deduplicate buses
//     const allBusesMap = new Map();
    
//     [...fromBuses, ...toBuses].forEach(bus => {
//       if (!allBusesMap.has(bus.deviceID)) {
//         allBusesMap.set(bus.deviceID, {
//           ...bus,
//           distanceFromStart: bus.distanceFromStart || Infinity,
//           distanceFromEnd: bus.distanceFromEnd || Infinity
//         });
//       } else {
//         // Update with minimum distances
//         const existing = allBusesMap.get(bus.deviceID);
//         existing.distanceFromStart = Math.min(existing.distanceFromStart || Infinity, bus.distanceFromStart || Infinity);
//         existing.distanceFromEnd = Math.min(existing.distanceFromEnd || Infinity, bus.distanceFromEnd || Infinity);
//       }
//     });

//     const allBuses = Array.from(allBusesMap.values());
//     console.log(`Total unique buses: ${allBuses.length}`);

//     // Analyze each bus for route relevance
//     const analyzedBuses = allBuses.map(bus => {
//       const routeAnalysis = analyzeRouteForJourney(bus, {
//         from: { lat: fromLatitude, lng: fromLongitude },
//         to: { lat: toLatitude, lng: toLongitude }
//       });
      
//       return {
//         ...bus,
//         routeAnalysis,
//         routeMatch: routeAnalysis, // Backwards compatibility
//         routeRelevanceScore: routeAnalysis.score,
//         // Add mock data
//         driverName: bus.driverName || "Driver Available",
//         driverPhone: bus.driverPhone || "+91-9876543210",
//         startTime: bus.startTime || "06:00 AM",
//         expectedTime: bus.expectedTime || "Calculating...",
//         destinationTime: bus.destinationTime || "08:00 PM",
//         status: bus.status || "Active",
//         distanceFromSearch: Math.min(bus.distanceFromStart || Infinity, bus.distanceFromEnd || Infinity)
//       };
//     });

//     // Filter for relevant buses
//     const relevantBuses = analyzedBuses.filter(bus => {
//       const isNearStart = (bus.distanceFromStart || Infinity) <= 3000; // 3km
//       const isNearEnd = (bus.distanceFromEnd || Infinity) <= 3000;
//       const hasPositiveScore = bus.routeRelevanceScore > 0.1;
//       const passesThrough = bus.routeAnalysis.passesThrough;
      
//       return isNearStart || isNearEnd || hasPositiveScore || passesThrough;
//     });

//     console.log(`Filtered to ${relevantBuses.length} relevant buses`);

//     // Sort by relevance
//     relevantBuses.sort((a, b) => {
//       // Prioritize buses that pass through the route
//       if (a.routeAnalysis.passesThrough && !b.routeAnalysis.passesThrough) return -1;
//       if (!a.routeAnalysis.passesThrough && b.routeAnalysis.passesThrough) return 1;
      
//       // Then by correct direction
//       if (a.routeAnalysis.isCorrectDirection && !b.routeAnalysis.isCorrectDirection) return -1;
//       if (!a.routeAnalysis.isCorrectDirection && b.routeAnalysis.isCorrectDirection) return 1;
      
//       // Then by relevance score
//       return b.routeRelevanceScore - a.routeRelevanceScore;
//     });

//     res.json({
//       success: true,
//       buses: relevantBuses.slice(0, 50), // Limit results
//       metadata: {
//         fromLocation: { lat: fromLatitude, lng: fromLongitude },
//         toLocation: { lat: toLatitude, lng: toLongitude },
//         radius: searchRadius,
//         fromBusesCount: fromBuses.length,
//         toBusesCount: toBuses.length,
//         routeBusesCount: relevantBuses.length,
//         searchTime: new Date().toISOString()
//       }
//     });

//   } catch (err) {
//     console.error('Error in getBusesAlongRoute:', err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while searching for route buses",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// /**
//  * Get bus by device ID
//  */
// export const getBusByDeviceId = async (req, res) => {
//   const { deviceId } = req.params;
  
//   if (!deviceId) {
//     return res.status(400).json({
//       success: false,
//       message: "Device ID is required"
//     });
//   }

//   try {
//     const bus = await Location.findOne({ deviceID: deviceId }).sort({ lastUpdated: -1 });
    
//     if (!bus) {
//       return res.status(404).json({
//         success: false,
//         message: `Bus with device ID ${deviceId} not found`
//       });
//     }

//     // Add mock data for better display
//     const busWithMockData = {
//       ...bus.toJSON(),
//       driverName: bus.driverName || "Driver Available",
//       driverPhone: bus.driverPhone || "+91-9876543210",
//       startTime: bus.startTime || "06:00 AM",
//       expectedTime: bus.expectedTime || "Calculating...",
//       destinationTime: bus.destinationTime || "08:00 PM",
//       status: bus.status || "Active"
//     };

//     res.json({
//       success: true,
//       latestLocations: busWithMockData,
//       metadata: {
//         deviceId,
//         searchTime: new Date().toISOString()
//       }
//     });

//   } catch (err) {
//     console.error('Error in getBusByDeviceId:', err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching bus details",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// /**
//  * Update bus location with enhanced route tracking
//  */
// export const updateBusLocation = async (req, res) => {
//   const { deviceID, latitude, longitude, additionalData } = req.body;
  
//   if (!deviceID || latitude === undefined || longitude === undefined) {
//     return res.status(400).json({
//       success: false,
//       message: "deviceID, latitude, and longitude are required"
//     });
//   }

//   try {
//     const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    
//     const locationData = {
//       location: {
//         type: "Point",
//         coordinates: coordinates
//       },
//       lastUpdated: new Date(),
//       ...additionalData
//     };

//     // Find existing bus or create new one
//     let bus = await Location.findOne({ deviceID });
    
//     if (bus) {
//       // Add current location to route history if it's significantly different
//       if (bus.location && bus.location.coordinates.length > 0) {
//         const prevCoords = bus.location.coordinates;
//         const distance = calculateDistance(
//           prevCoords[1], prevCoords[0], 
//           parseFloat(latitude), parseFloat(longitude)
//         );
        
//         // Only add to route if moved more than 10 meters
//         if (distance > 10) {
//           const routePoint = {
//             type: "Point",
//             coordinates: prevCoords,
//             timestamp: bus.lastUpdated || new Date()
//           };
          
//           bus.route.push(routePoint);
          
//           // Keep only last 100 route points
//           if (bus.route.length > 100) {
//             bus.route = bus.route.slice(-100);
//           }
//         }
//       }
      
//       // Update location
//       bus.location = locationData.location;
//       bus.lastUpdated = locationData.lastUpdated;
      
//       // Update any additional data
//       Object.keys(additionalData || {}).forEach(key => {
//         if (key !== 'location' && key !== 'lastUpdated') {
//           bus[key] = additionalData[key];
//         }
//       });
      
//       await bus.save();
//     } else {
//       // Create new bus
//       bus = new Location({
//         deviceID,
//         ...locationData,
//         route: []
//       });
//       await bus.save();
//     }

//     res.json({
//       success: true,
//       message: "Bus location updated successfully",
//       bus: bus.toJSON()
//     });

//   } catch (err) {
//     console.error('Error updating bus location:', err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating bus location",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// /**
//  * Get all buses with optional filtering
//  */
// export const getAllBusesWithFilter = async (req, res) => {
//   try {
//     const { status, hasRoute, limit = 100 } = req.query;
    
//     let filter = {};
    
//     if (status) {
//       filter.status = status;
//     }
    
//     if (hasRoute === 'true') {
//       filter['route.0'] = { $exists: true };
//     } else if (hasRoute === 'false') {
//       filter.route = { $size: 0 };
//     }
    
//     const buses = await Location.find(filter)
//       .sort({ lastUpdated: -1 })
//       .limit(parseInt(limit));
    
//     const busesWithMockData = buses.map(bus => ({
//       ...bus.toJSON(),
//       driverName: bus.driverName || "Driver Available",
//       driverPhone: bus.driverPhone || "+91-9876543210",
//       startTime: bus.startTime || "06:00 AM",
//       expectedTime: bus.expectedTime || "Calculating...",
//       destinationTime: bus.destinationTime || "08:00 PM",
//       status: bus.status || "Active",
//       hasRoute: bus.route && bus.route.length > 0,
//       routePoints: bus.route ? bus.route.length : 0
//     }));
    
//     res.json({
//       success: true,
//       buses: busesWithMockData,
//       metadata: {
//         totalFound: busesWithMockData.length,
//         filter,
//         searchTime: new Date().toISOString()
//       }
//     });
    
//   } catch (err) {
//     console.error('Error in getAllBusesWithFilter:', err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching buses",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// /**
//  * Delete a bus by deviceID
//  */
// export const deleteBus = async (req, res) => {
//   try {
//     const { deviceID } = req.params;
    
//     if (!deviceID) {
//       return res.status(400).json({
//         success: false,
//         message: "Device ID is required"
//       });
//     }
    
//     const deletedBus = await Location.findOneAndDelete({ deviceID });
    
//     if (!deletedBus) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus not found"
//       });
//     }
    
//     res.json({
//       success: true,
//       message: "Bus deleted successfully",
//       deletedBus: deletedBus.toJSON()
//     });
    
//   } catch (err) {
//     console.error('Error deleting bus:', err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while deleting bus",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// // Helper Functions

// /**
//  * Calculate distance between two points using Haversine formula
//  */
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371e3; // Earth's radius in meters
//   const φ1 = lat1 * Math.PI / 180;
//   const φ2 = lat2 * Math.PI / 180;
//   const Δφ = (lat2 - lat1) * Math.PI / 180;
//   const Δλ = (lon2 - lon1) * Math.PI / 180;

//   const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//             Math.cos(φ1) * Math.cos(φ2) *
//             Math.sin(Δλ/2) * Math.sin(Δλ/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//   return R * c;
// }

// /**
//  * Check if bus has route points near the journey points
//  */
// function hasRouteNearPoints(bus, journey, threshold = 1000) {
//   if (!bus.route || !Array.isArray(bus.route) || bus.route.length === 0) {
//     return false;
//   }
  
//   let nearFrom = false;
//   let nearTo = false;
  
//   bus.route.forEach(point => {
//     if (point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length >= 2) {
//       const [lng, lat] = point.coordinates;
      
//       const distanceFromStart = calculateDistance(
//         journey.from.lat, journey.from.lng, lat, lng
//       );
//       const distanceFromEnd = calculateDistance(
//         journey.to.lat, journey.to.lng, lat, lng
//       );
      
//       if (distanceFromStart <= threshold) nearFrom = true;
//       if (distanceFromEnd <= threshold) nearTo = true;
//     }
//   });
  
//   return nearFrom && nearTo;
// }

// /**
//  * Enhanced route analysis for journey matching
//  */
// function analyzeRouteForJourney(bus, journey) {
//   const analysis = {
//     score: 0,
//     fromDistance: Infinity,
//     toDistance: Infinity,
//     fromIndex: -1,
//     toIndex: -1,
//     isCorrectDirection: false,
//     passesThrough: false,
//     routePoints: []
//   };

//   // Check current location distance first
//   if (bus.location && bus.location.coordinates && bus.location.coordinates.length >= 2) {
//     const [lng, lat] = bus.location.coordinates;
//     analysis.fromDistance = calculateDistance(journey.from.lat, journey.from.lng, lat, lng);
//     analysis.toDistance = calculateDistance(journey.to.lat, journey.to.lng, lat, lng);
//   }

//   // Analyze route points if available
//   if (bus.route && Array.isArray(bus.route) && bus.route.length > 0) {
//     let minFromDistance = analysis.fromDistance;
//     let minToDistance = analysis.toDistance;
//     let closestFromIndex = -1;
//     let closestToIndex = -1;
    
//     bus.route.forEach((point, index) => {
//       if (point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length >= 2) {
//         const [lng, lat] = point.coordinates;

//         // Calculate distances to from and to points
//         const distanceFromStart = calculateDistance(
//           journey.from.lat, journey.from.lng, lat, lng
//         );
//         const distanceToEnd = calculateDistance(
//           journey.to.lat, journey.to.lng, lat, lng
//         );

//         // Track closest points
//         if (distanceFromStart < minFromDistance) {
//           minFromDistance = distanceFromStart;
//           closestFromIndex = index;
//         }
//         if (distanceToEnd < minToDistance) {
//           minToDistance = distanceToEnd;
//           closestToIndex = index;
//         }

//         // Store route point for analysis
//         analysis.routePoints.push({
//           lat, lng, index,
//           distanceFromStart,
//           distanceToEnd
//         });
//       }
//     });

//     analysis.fromDistance = minFromDistance;
//     analysis.toDistance = minToDistance;
//     analysis.fromIndex = closestFromIndex;
//     analysis.toIndex = closestToIndex;

//     // Check if route passes through both points (within reasonable distance)
//     const threshold = 1500; // 1.5km threshold
//     const nearFrom = minFromDistance <= threshold;
//     const nearTo = minToDistance <= threshold;
//     analysis.passesThrough = nearFrom && nearTo;

//     // Check direction (if destination point comes after starting point in route)
//     if (closestFromIndex >= 0 && closestToIndex >= 0) {
//       analysis.isCorrectDirection = closestToIndex > closestFromIndex;
//     }

//     // Calculate route relevance score
//     const maxDistance = 5000; // 5km max distance for scoring
//     const fromScore = Math.max(0, (maxDistance - minFromDistance) / maxDistance);
//     const toScore = Math.max(0, (maxDistance - minToDistance) / maxDistance);
    
//     let baseScore = (fromScore + toScore) / 2;
    
//     // Apply bonuses and penalties
//     if (analysis.isCorrectDirection) {
//       baseScore *= 1.5; // 50% bonus for correct direction
//     }
    
//     if (analysis.passesThrough) {
//       baseScore *= 2.0; // Double score for passing through both points
//     }
    
//     // Penalty for wrong direction but still give some score
//     if (closestFromIndex >= 0 && closestToIndex >= 0 && !analysis.isCorrectDirection) {
//       baseScore *= 0.4; // Reduced score for wrong direction
//     }

//     analysis.score = Math.max(0, Math.min(1, baseScore)); // Clamp between 0 and 1
//   }

//   // If no route data, score based on proximity to either point
//   if ((!bus.route || bus.route.length === 0) && analysis.fromDistance < Infinity) {
//     const maxDistance = 2000; // 2km for buses without route data
//     if (analysis.fromDistance <= maxDistance || analysis.toDistance <= maxDistance) {
//       const proximityScore = Math.max(
//         (maxDistance - analysis.fromDistance) / maxDistance,
//         (maxDistance - analysis.toDistance) / maxDistance
//       );
//       analysis.score = Math.max(0, proximityScore * 0.3); // Lower score for buses without route
//     }
//   }

//   return analysis;
// }


import Location from "../models/Location.model.js";

// Enhanced error logging
const logError = (functionName, error, context = {}) => {
  console.error(`[${functionName}] Error:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};

// Enhanced success logging
const logSuccess = (functionName, result, context = {}) => {
  console.log(`[${functionName}] Success:`, {
    result: typeof result === 'object' ? Object.keys(result) : result,
    context,
    timestamp: new Date().toISOString()
  });
};

export const updatelocation = async (req, res) => {
  try {
    const { deviceID, latitude, longitude } = req.body;
    
    console.log(`[updatelocation] Received request:`, { deviceID, latitude, longitude });

    if (!deviceID || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: deviceID, latitude, longitude",
        received: { deviceID: !!deviceID, latitude: !!latitude, longitude: !!longitude }
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
        details: { latitude: lat, longitude: lng, valid: false }
      });
    }

    const coordinates = [lng, lat]; // GeoJSON format [lng, lat]
    console.log(`[updatelocation] Parsed coordinates:`, coordinates);

    // Find bus by deviceID
    let bus = await Location.findOne({ deviceID });
    console.log(`[updatelocation] Existing bus found:`, !!bus);

    if (bus) {
      // Push previous location into route if it exists and is different
      if (bus.location && bus.location.coordinates.length > 0) {
        const prevCoords = bus.location.coordinates;
        const distance = calculateDistance(
          prevCoords[1], prevCoords[0], 
          lat, lng
        );
        
        console.log(`[updatelocation] Distance from previous location: ${distance}m`);
        
        // Only add to route if moved more than 10 meters
        if (distance > 10) {
          bus.route.push({
            type: "Point",
            coordinates: prevCoords,
            timestamp: bus.lastUpdated || new Date()
          });
          console.log(`[updatelocation] Added route point, total route points: ${bus.route.length}`);
        }
      }

      // Update current location
      bus.location = { type: "Point", coordinates };
      bus.lastUpdated = new Date();

      // Keep route history manageable (last 50 points)
      if (bus.route.length > 50) {
        bus.route = bus.route.slice(-50);
        console.log(`[updatelocation] Trimmed route to 50 points`);
      }

      await bus.save();
      logSuccess('updatelocation', 'Location updated', { deviceID, coordinates });
      return res.json({ success: true, message: "Location updated", bus });
    } else {
      // If new bus → create new document
      const newBus = new Location({
        deviceID,
        location: { type: "Point", coordinates },
        route: []
      });
      await newBus.save();
      logSuccess('updatelocation', 'New bus created', { deviceID, coordinates });
      return res.json({
        success: true,
        message: "New bus created",
        bus: newBus,
      });
    }
  } catch (error) {
    logError('updatelocation', error, req.body);
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
      received: { lat, lng, radius }
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const searchRadius = radius ? parseInt(radius) : 10000; // Default 10km

  console.log(`[getAllBus] Parsed values:`, { latitude, longitude, searchRadius });

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
        validLng: !isNaN(longitude) && longitude >= -180 && longitude <= 180
      }
    });
  }

  try {
    console.log(`[getAllBus] Searching near ${latitude}, ${longitude} within ${searchRadius}m`);
    
    // Debug: Check if there are any buses in the database
    const totalBusCount = await Location.countDocuments();
    console.log(`[getAllBus] Total buses in database: ${totalBusCount}`);
    
    // Debug: Get a sample of buses to check their coordinates
    const sampleBuses = await Location.find({}).limit(3);
    console.log(`[getAllBus] Sample bus locations:`, 
      sampleBuses.map(bus => ({
        deviceID: bus.deviceID,
        coordinates: bus.location?.coordinates,
        hasLocation: !!bus.location
      }))
    );
    
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude], // GeoJSON format
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
                  "m"
                ]
              },
              else: {
                $concat: [
                  { $toString: { $round: { $divide: ["$distanceFromSearch", 100] } } },
                  "0m"
                ]
              }
            }
          }
        }
      },
      {
        $sort: { distanceFromSearch: 1 },
      },
      {
        $limit: 100
      }
    ];

    console.log(`[getAllBus] Running aggregation pipeline...`);
    const buses = await Location.aggregate(pipeline);
    console.log(`[getAllBus] Aggregation returned ${buses.length} buses`);

    // Debug: Log distances of found buses
    buses.slice(0, 5).forEach(bus => {
      console.log(`[getAllBus] Bus ${bus.deviceID}: ${Math.round(bus.distanceFromSearch)}m away`);
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
      status: bus.status || "Active"
    }));

    logSuccess('getAllBus', `Found ${busesWithDistance.length} buses`, { latitude, longitude, searchRadius });

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
        sampleLocations: sampleBuses.map(b => b.location?.coordinates).filter(Boolean)
      }
    });
  } catch (err) {
    logError('getAllBus', err, { latitude, longitude, searchRadius });
    
    // Enhanced error response
    res.status(500).json({
      success: false,
      message: "Server error while searching for buses",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
      debug: process.env.NODE_ENV === "development" ? {
        searchParams: { latitude, longitude, searchRadius },
        errorType: err.name,
        mongoError: err.code
      } : undefined
    });
  }
};

/**
 * Enhanced route search with better debugging
 */
export const getBusesAlongRoute = async (req, res) => {
  const { fromLat, fromLng, toLat, toLng, radius } = req.query;
  
  console.log(`[getBusesAlongRoute] Query params:`, { fromLat, fromLng, toLat, toLng, radius });
  
  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.status(400).json({
      success: false,
      message: "fromLat, fromLng, toLat, toLng are required",
      received: { fromLat, fromLng, toLat, toLng, radius }
    });
  }

  const searchRadius = radius ? parseInt(radius) : 10000; // 10km default
  const fromLatitude = parseFloat(fromLat);
  const fromLongitude = parseFloat(fromLng);
  const toLatitude = parseFloat(toLat);
  const toLongitude = parseFloat(toLng);
  
  console.log(`[getBusesAlongRoute] Parsed coordinates:`, {
    from: [fromLatitude, fromLongitude],
    to: [toLatitude, toLongitude],
    radius: searchRadius
  });
  
  // Validate all coordinates
  const coords = [
    { name: 'fromLat', value: fromLatitude },
    { name: 'fromLng', value: fromLongitude },
    { name: 'toLat', value: toLatitude },
    { name: 'toLng', value: toLongitude }
  ];
  
  const invalidCoords = coords.filter(coord => 
    isNaN(coord.value) || 
    (coord.name.includes('Lat') && (coord.value < -90 || coord.value > 90)) ||
    (coord.name.includes('Lng') && (coord.value < -180 || coord.value > 180))
  );
  
  if (invalidCoords.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid coordinates",
      invalidCoords: invalidCoords.map(c => ({ [c.name]: c.value }))
    });
  }
  
  try {
    console.log(`[getBusesAlongRoute] Searching route: (${fromLatitude}, ${fromLongitude}) -> (${toLatitude}, ${toLongitude})`);
    
    // Debug: Check total buses
    const totalBuses = await Location.countDocuments();
    console.log(`[getBusesAlongRoute] Total buses in database: ${totalBuses}`);
    
    // Get all buses within expanded radius from both points
    const fromSearchPromise = Location.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [fromLongitude, fromLatitude] // GeoJSON [lng, lat]
          },
          distanceField: "distanceFromStart",
          maxDistance: searchRadius,
          spherical: true,
        },
      }
    ]);
    
    const toSearchPromise = Location.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [toLongitude, toLatitude] // GeoJSON [lng, lat]
          },
          distanceField: "distanceFromEnd",
          maxDistance: searchRadius,
          spherical: true,
        },
      }
    ]);

    const [fromBuses, toBuses] = await Promise.all([fromSearchPromise, toSearchPromise]);

    console.log(`[getBusesAlongRoute] Found ${fromBuses.length} buses near start, ${toBuses.length} near end`);

    // Combine and deduplicate buses
    const allBusesMap = new Map();
    
    [...fromBuses, ...toBuses].forEach(bus => {
      if (!allBusesMap.has(bus.deviceID)) {
        allBusesMap.set(bus.deviceID, {
          ...bus,
          distanceFromStart: bus.distanceFromStart || Infinity,
          distanceFromEnd: bus.distanceFromEnd || Infinity
        });
      } else {
        // Update with minimum distances
        const existing = allBusesMap.get(bus.deviceID);
        existing.distanceFromStart = Math.min(existing.distanceFromStart || Infinity, bus.distanceFromStart || Infinity);
        existing.distanceFromEnd = Math.min(existing.distanceFromEnd || Infinity, bus.distanceFromEnd || Infinity);
      }
    });

    const allBuses = Array.from(allBusesMap.values());
    console.log(`[getBusesAlongRoute] Total unique buses: ${allBuses.length}`);

    // Analyze each bus for route relevance
    const analyzedBuses = allBuses.map(bus => {
      const routeAnalysis = analyzeRouteForJourney(bus, {
        from: { lat: fromLatitude, lng: fromLongitude },
        to: { lat: toLatitude, lng: toLongitude }
      });
      
      return {
        ...bus,
        routeAnalysis,
        routeMatch: routeAnalysis, // Backwards compatibility
        routeRelevanceScore: routeAnalysis.score,
        // Add mock data
        driverName: bus.driverName || "Driver Available",
        driverPhone: bus.driverPhone || "+91-9876543210",
        startTime: bus.startTime || "06:00 AM",
        expectedTime: bus.expectedTime || "Calculating...",
        destinationTime: bus.destinationTime || "08:00 PM",
        status: bus.status || "Active",
        distanceFromSearch: Math.min(bus.distanceFromStart || Infinity, bus.distanceFromEnd || Infinity)
      };
    });

    // Filter for relevant buses
    const relevantBuses = analyzedBuses.filter(bus => {
      const isNearStart = (bus.distanceFromStart || Infinity) <= 5000; // 5km
      const isNearEnd = (bus.distanceFromEnd || Infinity) <= 5000;
      const hasPositiveScore = bus.routeRelevanceScore > 0.1;
      const passesThrough = bus.routeAnalysis.passesThrough;
      
      return isNearStart || isNearEnd || hasPositiveScore || passesThrough;
    });

    console.log(`[getBusesAlongRoute] Filtered to ${relevantBuses.length} relevant buses`);

    // Sort by relevance
    relevantBuses.sort((a, b) => {
      // Prioritize buses that pass through the route
      if (a.routeAnalysis.passesThrough && !b.routeAnalysis.passesThrough) return -1;
      if (!a.routeAnalysis.passesThrough && b.routeAnalysis.passesThrough) return 1;
      
      // Then by correct direction
      if (a.routeAnalysis.isCorrectDirection && !b.routeAnalysis.isCorrectDirection) return -1;
      if (!a.routeAnalysis.isCorrectDirection && b.routeAnalysis.isCorrectDirection) return 1;
      
      // Then by relevance score
      return b.routeRelevanceScore - a.routeRelevanceScore;
    });

    logSuccess('getBusesAlongRoute', `Found ${relevantBuses.length} route buses`, {
      from: [fromLatitude, fromLongitude],
      to: [toLatitude, toLongitude]
    });

    res.json({
      success: true,
      buses: relevantBuses.slice(0, 50), // Limit results
      metadata: {
        fromLocation: { lat: fromLatitude, lng: fromLongitude },
        toLocation: { lat: toLatitude, lng: toLongitude },
        radius: searchRadius,
        fromBusesCount: fromBuses.length,
        toBusesCount: toBuses.length,
        routeBusesCount: relevantBuses.length,
        totalInDatabase: totalBuses,
        searchTime: new Date().toISOString()
      },
      debug: {
        fromSearchCoords: [fromLongitude, fromLatitude],
        toSearchCoords: [toLongitude, toLatitude],
        analysisResults: analyzedBuses.slice(0, 3).map(bus => ({
          deviceID: bus.deviceID,
          score: bus.routeRelevanceScore,
          passesThrough: bus.routeAnalysis.passesThrough,
          isCorrectDirection: bus.routeAnalysis.isCorrectDirection
        }))
      }
    });

  } catch (err) {
    logError('getBusesAlongRoute', err, { fromLatitude, fromLongitude, toLatitude, toLongitude, searchRadius });
    res.status(500).json({
      success: false,
      message: "Server error while searching for route buses",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      debug: process.env.NODE_ENV === 'development' ? {
        searchParams: { fromLatitude, fromLongitude, toLatitude, toLongitude, searchRadius },
        errorType: err.name
      } : undefined
    });
  }
};

// ADDED: New debug endpoint to check database state
export const debugDatabase = async (req, res) => {
  try {
    const stats = {
      totalBuses: await Location.countDocuments(),
      busesWithLocation: await Location.countDocuments({ location: { $exists: true } }),
      busesWithRoute: await Location.countDocuments({ 'route.0': { $exists: true } }),
      sampleBuses: await Location.find({}).limit(5).select('deviceID location route')
    };
    
    // Check indexes
    const indexes = await Location.collection.getIndexes();
    
    res.json({
      success: true,
      debug: {
        ...stats,
        indexes: Object.keys(indexes),
        hasGeoIndex: Object.keys(indexes).some(key => key.includes('location')),
        sampleCoordinates: stats.sampleBuses.map(bus => ({
          deviceID: bus.deviceID,
          coordinates: bus.location?.coordinates,
          coordinateType: bus.location?.coordinates ? typeof bus.location.coordinates[0] : 'none'
        }))
      }
    });
  } catch (error) {
    logError('debugDatabase', error);
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
    
    logSuccess('getLocation', 'Device found', { deviceID });
    return res.status(200).json({
      message: "device location get successfully",
      latestLocations,
      success: true,
    });
  } catch (error) {
    logError('getLocation', error, { deviceID: req.params.deviceID });
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
      route: []
    });

    logSuccess('createBusId', 'Bus created', { deviceID });
    return res.status(200).json({
      message: "bus registered successfully",
      newBus: newBus.toObject(),
      success: true,
    });
  } catch (error) {
    logError('createBusId', error, req.body);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getBusByDeviceId = async (req, res) => {
  const { deviceId } = req.params;
  console.log(`[getBusByDeviceId] Looking for device: ${deviceId}`);
  
  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: "Device ID is required"
    });
  }

  try {
    const bus = await Location.findOne({ deviceID: deviceId }).sort({ lastUpdated: -1 });
    
    if (!bus) {
      console.log(`[getBusByDeviceId] Bus not found: ${deviceId}`);
      return res.status(404).json({
        success: false,
        message: `Bus with device ID ${deviceId} not found`
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
      status: bus.status || "Active"
    };

    logSuccess('getBusByDeviceId', 'Bus found', { deviceId });
    res.json({
      success: true,
      latestLocations: busWithMockData,
      metadata: {
        deviceId,
        searchTime: new Date().toISOString()
      }
    });

  } catch (err) {
    logError('getBusByDeviceId', err, { deviceId });
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus details",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper Functions

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
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
 * Enhanced route analysis for journey matching with debugging
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
    routePoints: []
  };

  // Check current location distance first
  if (bus.location && bus.location.coordinates && bus.location.coordinates.length >= 2) {
    const [lng, lat] = bus.location.coordinates;
    analysis.fromDistance = calculateDistance(journey.from.lat, journey.from.lng, lat, lng);
    analysis.toDistance = calculateDistance(journey.to.lat, journey.to.lng, lat, lng);
  }

  // Analyze route points if available
  if (bus.route && Array.isArray(bus.route) && bus.route.length > 0) {
    let minFromDistance = analysis.fromDistance;
    let minToDistance = analysis.toDistance;
    let closestFromIndex = -1;
    let closestToIndex = -1;
    
    bus.route.forEach((point, index) => {
      if (point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length >= 2) {
        const [lng, lat] = point.coordinates;

        const distanceFromStart = calculateDistance(
          journey.from.lat, journey.from.lng, lat, lng
        );
        const distanceToEnd = calculateDistance(
          journey.to.lat, journey.to.lng, lat, lng
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
          lat, lng, index,
          distanceFromStart,
          distanceToEnd
        });
      }
    });

    analysis.fromDistance = minFromDistance;
    analysis.toDistance = minToDistance;
    analysis.fromIndex = closestFromIndex;
    analysis.toIndex = closestToIndex;

    // Check if route passes through both points
    const threshold = 2000; // 2km threshold
    const nearFrom = minFromDistance <= threshold;
    const nearTo = minToDistance <= threshold;
    analysis.passesThrough = nearFrom && nearTo;

    // Check direction
    if (closestFromIndex >= 0 && closestToIndex >= 0) {
      analysis.isCorrectDirection = closestToIndex > closestFromIndex;
    }

    // Calculate route relevance score
    const maxDistance = 5000; // 5km max distance for scoring
    const fromScore = Math.max(0, (maxDistance - minFromDistance) / maxDistance);
    const toScore = Math.max(0, (maxDistance - minToDistance) / maxDistance);
    
    let baseScore = (fromScore + toScore) / 2;
    
    if (analysis.isCorrectDirection) baseScore *= 1.5;
    if (analysis.passesThrough) baseScore *= 2.0;
    if (closestFromIndex >= 0 && closestToIndex >= 0 && !analysis.isCorrectDirection) {
      baseScore *= 0.4;
    }

    analysis.score = Math.max(0, Math.min(1, baseScore));
  }

  // If no route data, score based on proximity
  if ((!bus.route || bus.route.length === 0) && analysis.fromDistance < Infinity) {
    const maxDistance = 3000; // 3km for buses without route data
    if (analysis.fromDistance <= maxDistance || analysis.toDistance <= maxDistance) {
      const proximityScore = Math.max(
        (maxDistance - analysis.fromDistance) / maxDistance,
        (maxDistance - analysis.toDistance) / maxDistance
      );
      analysis.score = Math.max(0, proximityScore * 0.3);
    }
  }

  return analysis;
}