// services/busSearchService.js

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
      
      // Location data - handle both API response formats
      location: busData.location,
      currentLocation: busData.currentLocation || 'Live tracking available',
      lat: busData.location?.coordinates?.[1] || busData.lat,
      lng: busData.location?.coordinates?.[0] || busData.lng,
      latitude: busData.location?.coordinates?.[1] || busData.latitude,
      longitude: busData.location?.coordinates?.[0] || busData.longitude,
      
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
      formattedDistance: busData.formattedDistance,
      
      // Route match data (if available)
      routeMatch: busData.routeMatch,
      routeAnalysis: busData.routeAnalysis,
      
      // Metadata
      _id: busData._id,
      __v: busData.__v
    };
  }

  async findBusesByRoute(fromCoords, toCoords, options = {}) {
    const {
      radius = 1000, // 1km default radius
      maxResults = 50
    } = options;

    try {
      // Search for buses near the starting point
      const fromBuses = await this.findNearbyBuses(fromCoords, radius);
      
      // Search for buses near the destination point
      const toBuses = await this.findNearbyBuses(toCoords, radius);
      
      // Find buses that pass through both points or have routes connecting them
      const routeBuses = this.findBusesAlongRoute(fromBuses, toBuses, fromCoords, toCoords);
      
      return {
        success: true,
        buses: routeBuses.slice(0, maxResults),
        fromBuses,
        toBuses,
        metadata: {
          searchType: 'route',
          fromCoords,
          toCoords,
          radius,
          totalFound: routeBuses.length,
          routeInfo: {
            from: `${fromCoords.lat?.toFixed(4)}, ${fromCoords.lon?.toFixed(4)}`,
            to: `${toCoords.lat?.toFixed(4)}, ${toCoords.lon?.toFixed(4)}`
          }
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

  async findNearbyBuses(coords, radius = 1000) {
    try {
      // Use the correct coordinate property names for the API
      const lat = coords.lat || coords.latitude;
      const lng = coords.lon || coords.lng || coords.longitude;
      
      if (!lat || !lng) {
        throw new Error('Invalid coordinates provided');
      }
      
      const response = await apiConnector("GET",
        `${this.baseURL}/get/search?lat=${lat}&lng=${lng}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different API response formats
      let buses = [];
      if (data.success && data.buses) {
        buses = data.buses;
      } else if (Array.isArray(data)) {
        buses = data;
      } else {
        buses = [];
      }
      
      // Transform and add distance calculation to each bus
      return buses.map(bus => {
        const transformedBus = this.transformBusData(bus);
        
        // Calculate distance if not already provided
        if (!transformedBus.distanceFromSearch) {
          const busLat = transformedBus.lat || transformedBus.latitude;
          const busLng = transformedBus.lng || transformedBus.longitude;
          
          if (busLat && busLng) {
            transformedBus.distanceFromSearch = this.calculateDistance(
              lat, lng, busLat, busLng
            );
          }
        }
        
        return transformedBus;
      }).sort((a, b) => (a.distanceFromSearch || 0) - (b.distanceFromSearch || 0));

    } catch (error) {
      console.error('Error finding nearby buses:', error);
      throw error;
    }
  }

  findBusesAlongRoute(fromBuses, toBuses, fromCoords, toCoords) {
    // Create sets of bus IDs for efficient lookup
    const fromBusIds = new Set(fromBuses.map(bus => bus.deviceID));
    const toBusIds = new Set(toBuses.map(bus => bus.deviceID));
    
    // Find buses that appear in both searches (pass through both points)
    const directBuses = fromBuses.filter(bus => toBusIds.has(bus.deviceID));
    
    // Find buses that have route points near both locations
    const routeBuses = [];
    const processedBusIds = new Set();
    
    [...fromBuses, ...toBuses].forEach(bus => {
      if (processedBusIds.has(bus.deviceID)) return;
      processedBusIds.add(bus.deviceID);
      
      if (this.busPassesThroughRoute(bus, fromCoords, toCoords)) {
        routeBuses.push({
          ...bus,
          routeMatch: this.analyzeRouteMatch(bus, fromCoords, toCoords)
        });
      }
    });
    
    // Combine and deduplicate results
    const allBuses = [...directBuses, ...routeBuses];
    const uniqueBuses = allBuses.filter((bus, index, self) => 
      index === self.findIndex(b => b.deviceID === bus.deviceID)
    );
    
    // Sort by relevance (direct buses first, then by distance)
    return uniqueBuses.sort((a, b) => {
      // Prioritize buses that pass through both points
      const aIsDirect = fromBusIds.has(a.deviceID) && toBusIds.has(a.deviceID);
      const bIsDirect = fromBusIds.has(b.deviceID) && toBusIds.has(b.deviceID);
      
      if (aIsDirect && !bIsDirect) return -1;
      if (!aIsDirect && bIsDirect) return 1;
      
      // Then sort by distance from starting point
      return (a.distanceFromSearch || 0) - (b.distanceFromSearch || 0);
    });
  }

  /**
   * Check if a bus route passes through both points within reasonable distance
   */
  busPassesThroughRoute(bus, fromCoords, toCoords, threshold = 500) { // 500m threshold
    if (!bus.route || !Array.isArray(bus.route)) return false;
    
    let nearFrom = false;
    let nearTo = false;
    
    bus.route.forEach(point => {
      let lat, lng;
      
      // Handle different route point formats
      if (point.coordinates && point.coordinates.length >= 2) {
        [lng, lat] = point.coordinates; // GeoJSON format
      } else if (point.lat && point.lng) {
        lat = point.lat;
        lng = point.lng;
      } else if (point.latitude && point.longitude) {
        lat = point.latitude;
        lng = point.longitude;
      } else {
        return; // Skip invalid points
      }
      
      const distanceFromStart = this.calculateDistance(
        fromCoords.lat || fromCoords.latitude, 
        fromCoords.lon || fromCoords.lng || fromCoords.longitude, 
        lat, lng
      );
      const distanceFromEnd = this.calculateDistance(
        toCoords.lat || toCoords.latitude, 
        toCoords.lon || toCoords.lng || toCoords.longitude, 
        lat, lng
      );
      
      if (distanceFromStart <= threshold) nearFrom = true;
      if (distanceFromEnd <= threshold) nearTo = true;
    });
    
    return nearFrom && nearTo;
  }

  /**
   * Analyze how well a bus route matches the desired journey
   */
  analyzeRouteMatch(bus, fromCoords, toCoords) {
    if (!bus.route || !Array.isArray(bus.route)) {
      return { score: 0, fromDistance: Infinity, toDistance: Infinity };
    }
    
    let minFromDistance = Infinity;
    let minToDistance = Infinity;
    let fromIndex = -1;
    let toIndex = -1;
    
    bus.route.forEach((point, index) => {
      let lat, lng;
      
      // Handle different route point formats
      if (point.coordinates && point.coordinates.length >= 2) {
        [lng, lat] = point.coordinates;
      } else if (point.lat && point.lng) {
        lat = point.lat;
        lng = point.lng;
      } else if (point.latitude && point.longitude) {
        lat = point.latitude;
        lng = point.longitude;
      } else {
        return;
      }
      
      const distanceFromStart = this.calculateDistance(
        fromCoords.lat || fromCoords.latitude, 
        fromCoords.lon || fromCoords.lng || fromCoords.longitude, 
        lat, lng
      );
      const distanceFromEnd = this.calculateDistance(
        toCoords.lat || toCoords.latitude, 
        toCoords.lon || toCoords.lng || toCoords.longitude, 
        lat, lng
      );
      
      if (distanceFromStart < minFromDistance) {
        minFromDistance = distanceFromStart;
        fromIndex = index;
      }
      if (distanceFromEnd < minToDistance) {
        minToDistance = distanceFromEnd;
        toIndex = index;
      }
    });
    
    // Calculate route direction score (positive if bus goes from -> to)
    const directionScore = toIndex > fromIndex ? 1 : -0.5;
    
    // Calculate overall match score
    const maxDistance = 2000; // 2km
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

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
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
      const response = await apiConnector("GET",`${this.baseURL}/bus/${deviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle different response formats
      if (data.success && data.latestLocations) {
        return this.transformBusData(data.latestLocations);
      } else if (data.latestLocations) {
        return this.transformBusData(data.latestLocations);
      } else {
        return this.transformBusData(data);
      }
    } catch (error) {
      console.error('Error fetching bus by ID:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const busSearchService = new BusSearchService();