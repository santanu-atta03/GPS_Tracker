// // services/busSearchService.js

// import { apiConnector } from "./apiConnector";

// export class BusSearchService {
//   constructor(baseURL = import.meta.env.VITE_BASE_URL) {
//     this.baseURL = baseURL;
//   }

//   /**
//    * Transform API response to consistent format
//    */
//   transformBusData(busData) {
//     if (!busData) return null;
    
//     return {
//       // Core identifiers
//       deviceID: busData.deviceID,
//       id: busData.deviceID,
//       deviceId: busData.deviceID,
      
//       // Basic info
//       name: busData.name || `Bus ${busData.deviceID}`,
//       busName: busData.busName || `Bus ${busData.deviceID}`,
//       status: busData.status || 'Active',
      
//       // Location data - handle both API response formats
//       location: busData.location,
//       currentLocation: busData.currentLocation || 'Live tracking available',
//       lat: busData.location?.coordinates?.[1] || busData.lat,
//       lng: busData.location?.coordinates?.[0] || busData.lng,
//       latitude: busData.location?.coordinates?.[1] || busData.latitude,
//       longitude: busData.location?.coordinates?.[0] || busData.longitude,
      
//       // Route data
//       route: busData.route || [],
      
//       // Time data
//       lastUpdated: busData.lastUpdated,
//       timestamp: busData.lastUpdated,
//       updatedAt: busData.lastUpdated,
//       startTime: busData.startTime || '06:00 AM',
//       expectedTime: busData.expectedTime || 'Calculating...',
//       destinationTime: busData.destinationTime || '08:00 PM',
      
//       // Driver data
//       driverName: busData.driverName || 'Driver Available',
//       driver: busData.driverName || 'Driver Available',
//       driverPhone: busData.driverPhone || 'Contact Support',
      
//       // Distance data (if available)
//       distanceFromSearch: busData.distanceFromSearch,
//       formattedDistance: busData.formattedDistance,
      
//       // Route match data (if available)
//       routeMatch: busData.routeMatch,
//       routeAnalysis: busData.routeAnalysis,
      
//       // Metadata
//       _id: busData._id,
//       __v: busData.__v
//     };
//   }

//   /**
//    * Enhanced route search that finds buses along or near the desired route
//    */
//   async findBusesByRoute(fromCoords, toCoords, options = {}) {
//     const { radius = 10000, maxResults = 50 } = options; // Increased default radius to 5km

//     try {
//       console.log('Searching for buses along route:', {
//         from: fromCoords,
//         to: toCoords,
//         radius
//       });

//       // Get all buses within a reasonable distance from both points
//       const [fromBuses, toBuses] = await Promise.all([
//         this.findNearbyBuses(fromCoords, radius),
//         this.findNearbyBuses(toCoords, radius)
//       ]);

//       console.log(`Found ${fromBuses.length} buses near starting point, ${toBuses.length} near destination`);

//       // Combine and deduplicate all buses
//       const allBusesMap = new Map();
      
//       [...fromBuses, ...toBuses].forEach(bus => {
//         if (!allBusesMap.has(bus.deviceID)) {
//           allBusesMap.set(bus.deviceID, bus);
//         }
//       });

//       const allBuses = Array.from(allBusesMap.values());
//       console.log(`Total unique buses found: ${allBuses.length}`);

//       // Analyze each bus for route relevance
//       const analyzedBuses = allBuses.map(bus => {
//         const routeAnalysis = this.analyzeRouteForJourney(bus, fromCoords, toCoords);
//         return {
//           ...bus,
//           routeMatch: routeAnalysis,
//           routeRelevanceScore: routeAnalysis.score
//         };
//       });

//       // Filter buses based on route relevance
//       const relevantBuses = analyzedBuses.filter(bus => {
//         // Include buses that are either:
//         // 1. Close to the starting point (within 2km)
//         // 2. Close to the destination (within 2km)
//         // 3. Have route points that pass through the journey path
//         // 4. Have a positive route relevance score

//         const isNearStart = bus.routeMatch.fromDistance <= 2000;
//         const isNearDestination = bus.routeMatch.toDistance <= 2000;
//         const hasPositiveScore = bus.routeRelevanceScore > 0;
//         const passesThrough = bus.routeMatch.passesThrough;

//         return isNearStart || isNearDestination || hasPositiveScore || passesThrough;
//       });

//       console.log(`Filtered to ${relevantBuses.length} relevant buses`);

//       // Sort by route relevance and proximity
//       relevantBuses.sort((a, b) => {
//         // First priority: buses that pass through the route
//         if (a.routeMatch.passesThrough && !b.routeMatch.passesThrough) return -1;
//         if (!a.routeMatch.passesThrough && b.routeMatch.passesThrough) return 1;

//         // Second priority: correct direction
//         if (a.routeMatch.isCorrectDirection && !b.routeMatch.isCorrectDirection) return -1;
//         if (!a.routeMatch.isCorrectDirection && b.routeMatch.isCorrectDirection) return 1;

//         // Third priority: route relevance score
//         if (a.routeRelevanceScore !== b.routeRelevanceScore) {
//           return b.routeRelevanceScore - a.routeRelevanceScore;
//         }

//         // Finally: distance from starting point
//         return (a.routeMatch.fromDistance || Infinity) - (b.routeMatch.fromDistance || Infinity);
//       });

//       const finalResults = relevantBuses.slice(0, maxResults);

//       return {
//         success: true,
//         buses: finalResults,
//         metadata: {
//           searchType: 'route',
//           fromCoords,
//           toCoords,
//           radius,
//           totalFound: finalResults.length,
//           totalScanned: allBuses.length,
//           routeInfo: {
//             from: `${fromCoords.lat?.toFixed(4)}, ${fromCoords.lon?.toFixed(4)}`,
//             to: `${toCoords.lat?.toFixed(4)}, ${toCoords.lon?.toFixed(4)}`
//           }
//         }
//       };
//     } catch (error) {
//       console.error('Error in findBusesByRoute:', error);
//       return {
//         success: false,
//         error: error.message,
//         buses: []
//       };
//     }
//   }

//   /**
//    * Enhanced route analysis that checks if a bus route is relevant to the journey
//    */
//   analyzeRouteForJourney(bus, fromCoords, toCoords) {
//     const analysis = {
//       score: 0,
//       fromDistance: Infinity,
//       toDistance: Infinity,
//       fromIndex: -1,
//       toIndex: -1,
//       isCorrectDirection: false,
//       passesThrough: false,
//       routePoints: []
//     };

//     // Check current location distance
//     if (bus.lat && bus.lng) {
//       analysis.fromDistance = Math.min(
//         analysis.fromDistance,
//         this.calculateDistance(fromCoords.lat, fromCoords.lon, bus.lat, bus.lng)
//       );
//       analysis.toDistance = Math.min(
//         analysis.toDistance,
//         this.calculateDistance(toCoords.lat, toCoords.lon, bus.lat, bus.lng)
//       );
//     }

//     // Analyze route points if available
//     if (bus.route && Array.isArray(bus.route) && bus.route.length > 0) {
//       let minFromDistance = Infinity;
//       let minToDistance = Infinity;
//       let closestFromIndex = -1;
//       let closestToIndex = -1;
      
//       bus.route.forEach((point, index) => {
//         let lat, lng;
        
//         // Handle different route point formats
//         if (point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length >= 2) {
//           [lng, lat] = point.coordinates; // GeoJSON format [lng, lat]
//         } else if (point.lat !== undefined && point.lng !== undefined) {
//           lat = point.lat;
//           lng = point.lng;
//         } else if (point.latitude !== undefined && point.longitude !== undefined) {
//           lat = point.latitude;
//           lng = point.longitude;
//         } else {
//           return; // Skip invalid points
//         }

//         if (lat === undefined || lng === undefined) return;

//         // Calculate distances to from and to points
//         const distanceFromStart = this.calculateDistance(
//           fromCoords.lat || fromCoords.latitude, 
//           fromCoords.lon || fromCoords.lng || fromCoords.longitude, 
//           lat, lng
//         );
//         const distanceToEnd = this.calculateDistance(
//           toCoords.lat || toCoords.latitude, 
//           toCoords.lon || toCoords.lng || toCoords.longitude, 
//           lat, lng
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
//       });

//       analysis.fromDistance = Math.min(analysis.fromDistance, minFromDistance);
//       analysis.toDistance = Math.min(analysis.toDistance, minToDistance);
//       analysis.fromIndex = closestFromIndex;
//       analysis.toIndex = closestToIndex;

//       // Check if route passes through both points (within reasonable distance)
//       const threshold = 1000; // 1km threshold
//       const nearFrom = minFromDistance <= threshold;
//       const nearTo = minToDistance <= threshold;
//       analysis.passesThrough = nearFrom && nearTo;

//       // Check direction (if destination point comes after starting point in route)
//       if (closestFromIndex >= 0 && closestToIndex >= 0) {
//         analysis.isCorrectDirection = closestToIndex > closestFromIndex;
//       }

//       // Calculate route relevance score
//       const maxDistance = 3000; // 3km max distance
//       const fromScore = Math.max(0, (maxDistance - minFromDistance) / maxDistance);
//       const toScore = Math.max(0, (maxDistance - minToDistance) / maxDistance);
      
//       let baseScore = (fromScore + toScore) / 2;
      
//       // Bonus for correct direction
//       if (analysis.isCorrectDirection) {
//         baseScore *= 1.5;
//       }
      
//       // Bonus for passing through both points
//       if (analysis.passesThrough) {
//         baseScore *= 2.0;
//       }
      
//       // Penalty for wrong direction but still some relevance
//       if (closestFromIndex >= 0 && closestToIndex >= 0 && !analysis.isCorrectDirection) {
//         baseScore *= 0.3;
//       }

//       analysis.score = baseScore;
//     }

//     // If no route data, score based on proximity to either point
//     if ((!bus.route || bus.route.length === 0) && analysis.fromDistance < Infinity) {
//       const maxDistance = 2000; // 2km for buses without route data
//       if (analysis.fromDistance <= maxDistance || analysis.toDistance <= maxDistance) {
//         const proximityScore = Math.max(
//           (maxDistance - analysis.fromDistance) / maxDistance,
//           (maxDistance - analysis.toDistance) / maxDistance
//         );
//         analysis.score = Math.max(0, proximityScore * 0.5); // Lower score for buses without route
//       }
//     }

//     return analysis;
//   }

//   /**
//    * Find nearby buses with improved error handling
//    */
//   async findNearbyBuses(coords, radius) {
//     try {
//       const lat = coords.lat || coords.latitude;
//       const lng = coords.lon || coords.lng || coords.longitude;

//       if (!lat || !lng) {
//         throw new Error('Invalid coordinates provided');
//       }

//       console.log(`Searching for buses near: ${lat}, ${lng} within ${radius}m`);

//       const response = await apiConnector("GET",
//         `${this.baseURL}/get/search?lat=${lat}&lng=${lng}&radius=${radius}`
//       );
      
//       if (!response || !response.data) {
//         throw new Error('No response data received');
//       }

//       const data = response.data;

//       if (!data.success) {
//         console.warn('API search returned success: false', data);
//         return []; // Return empty array instead of throwing error
//       }
      
//       const buses = data.buses || [];
//       console.log(`API returned ${buses.length} buses`);
      
//       return buses.map(bus => this.transformBusData(bus));
      
//     } catch (error) {
//       console.error('Error finding nearby buses:', error);
//       // Return empty array instead of throwing to allow the search to continue
//       return [];
//     }
//   }

//   /**
//    * Calculate distance between two points using Haversine formula
//    */
//   calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = lat1 * Math.PI / 180;
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;

//     const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ/2) * Math.sin(Δλ/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//     return R * c;
//   }

//   /**
//    * Format distance for display
//    */
//   formatDistance(meters) {
//     if (meters < 1000) {
//       return `${Math.round(meters)}m`;
//     } else {
//       return `${(meters / 1000).toFixed(1)}km`;
//     }
//   }

//   /**
//    * Get bus details by device ID
//    */
//   async getBusById(deviceId) {
//     try {
//       const response = await apiConnector("GET",`${this.baseURL}/bus/${deviceId}`);
//       if (!response || !response.data) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = response.data;
      
//       // Handle different response formats
//       if (data.success && data.latestLocations) {
//         return this.transformBusData(data.latestLocations);
//       } else if (data.latestLocations) {
//         return this.transformBusData(data.latestLocations);
//       } else {
//         return this.transformBusData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching bus by ID:', error);
//       throw error;
//     }
//   }
// }

// // Create singleton instance
// export const busSearchService = new BusSearchService();


// services/busSearchService.js - FIXED VERSION

import { apiConnector } from "./apiConnector";

export class BusSearchService {
  constructor(baseURL = import.meta.env.VITE_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Transform API response to consistent format
   */
  transformBusData(busData) {
    if (!busData) return null;
    
    return {
      // Core identifiers
      deviceID: busData.deviceID,
      id: busData.deviceID,
      deviceId: busData.deviceID,
      
      // Basic info
      name: busData.name || `Bus ${busData.deviceID}`,
      busName: busData.busName || `Bus ${busData.deviceID}`,
      status: busData.status || 'Active',
      
      // Location data - FIXED coordinate handling
      location: busData.location,
      currentLocation: busData.currentLocation || 'Live tracking available',
      // Handle GeoJSON format [lng, lat] properly
      lat: busData.location?.coordinates?.[1] || busData.lat || busData.latitude,
      lng: busData.location?.coordinates?.[0] || busData.lng || busData.longitude,
      latitude: busData.location?.coordinates?.[1] || busData.latitude || busData.lat,
      longitude: busData.location?.coordinates?.[0] || busData.longitude || busData.lng,
      
      // Route data
      route: busData.route || [],
      
      // Time data
      lastUpdated: busData.lastUpdated,
      timestamp: busData.lastUpdated,
      updatedAt: busData.lastUpdated,
      startTime: busData.startTime || '06:00 AM',
      expectedTime: busData.expectedTime || 'Calculating...',
      destinationTime: busData.destinationTime || '08:00 PM',
      
      // Driver data
      driverName: busData.driverName || 'Driver Available',
      driver: busData.driverName || 'Driver Available',
      driverPhone: busData.driverPhone || 'Contact Support',
      
      // Distance data (if available)
      distanceFromSearch: busData.distanceFromSearch,
      distanceFromStart: busData.distanceFromStart,
      distanceFromEnd: busData.distanceFromEnd,
      formattedDistance: busData.formattedDistance,
      
      // Route match data (if available)
      routeMatch: busData.routeMatch,
      routeAnalysis: busData.routeAnalysis,
      
      // Metadata
      _id: busData._id,
      __v: busData.__v
    };
  }

  /**
   * FIXED: Enhanced route search with proper endpoint usage
   */
  async findBusesByRoute(fromCoords, toCoords, options = {}) {
    const { radius = 10000, maxResults = 50 } = options;

    try {
      console.log('Searching for buses along route:', {
        from: fromCoords,
        to: toCoords,
        radius
      });

      // FIXED: Use the correct route search endpoint
      const response = await apiConnector("GET", 
        `${this.baseURL}/route/search?fromLat=${fromCoords.lat}&fromLng=${fromCoords.lng}&toLat=${toCoords.lat}&toLng=${toCoords.lng}&radius=${radius}`
      );
      
      if (!response || !response.data) {
        throw new Error('No response data received');
      }

      const data = response.data;

      if (!data.success) {
        console.warn('API route search returned success: false', data);
        return {
          success: false,
          error: data.message || 'Route search failed',
          buses: []
        };
      }
      
      const buses = data.buses || [];
      console.log(`Route API returned ${buses.length} buses`);
      
      const transformedBuses = buses.map(bus => this.transformBusData(bus));

      return {
        success: true,
        buses: transformedBuses,
        metadata: data.metadata || {
          searchType: 'route',
          fromCoords,
          toCoords,
          radius,
          totalFound: transformedBuses.length
        }
      };
    } catch (error) {
      console.error('Error in findBusesByRoute:', error);
      return {
        success: false,
        error: error.message,
        buses: []
      };
    }
  }

  /**
   * FIXED: Find nearby buses with better error handling
   */
  async findNearbyBuses(coords, radius = 10000) {
    try {
      const lat = coords.lat || coords.latitude;
      const lng = coords.lng || coords.lon || coords.longitude;

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates provided');
      }

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Coordinates out of valid range');
      }

      console.log(`Searching for buses near: ${lat}, ${lng} within ${radius}m`);

      const response = await apiConnector("GET",
        `${this.baseURL}/get/search?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      
      if (!response || !response.data) {
        throw new Error('No response data received');
      }

      const data = response.data;

      if (!data.success) {
        console.warn('API search returned success: false', data);
        return []; // Return empty array instead of throwing error
      }
      
      const buses = data.buses || [];
      console.log(`Nearby API returned ${buses.length} buses`);
      
      return buses.map(bus => this.transformBusData(bus));
      
    } catch (error) {
      console.error('Error finding nearby buses:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
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
   * Format distance for display
   */
  formatDistance(meters) {
    if (!meters || meters === Infinity) return 'Unknown';
    
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Get bus details by device ID
   */
  async getBusById(deviceId) {
    try {
      if (!deviceId) {
        throw new Error('Device ID is required');
      }

      const response = await apiConnector("GET",`${this.baseURL}/bus/${deviceId}`);
      if (!response || !response.data) {
        throw new Error(`HTTP error! status: ${response?.status || 'unknown'}`);
      }
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch bus details');
      }
      
      // Handle different response formats
      if (data.latestLocations) {
        return this.transformBusData(data.latestLocations);
      } else if (data.bus) {
        return this.transformBusData(data.bus);
      } else {
        return this.transformBusData(data);
      }
    } catch (error) {
      console.error('Error fetching bus by ID:', error);
      throw error;
    }
  }

  /**
   * ADDED: Debug method to test coordinates
   */
  async debugCoordinates(lat, lng) {
    console.log('Debug coordinates:', { lat, lng });
    console.log('Lat type:', typeof lat, 'Lng type:', typeof lng);
    console.log('Lat valid:', !isNaN(lat) && lat >= -90 && lat <= 90);
    console.log('Lng valid:', !isNaN(lng) && lng >= -180 && lng <= 180);
    
    // Test a simple nearby search
    try {
      const result = await this.findNearbyBuses({ lat, lng }, 5000);
      console.log('Debug search result:', result.length, 'buses found');
      return result;
    } catch (error) {
      console.error('Debug search error:', error);
      return [];
    }
  }
}

// Create singleton instance
export const busSearchService = new BusSearchService();