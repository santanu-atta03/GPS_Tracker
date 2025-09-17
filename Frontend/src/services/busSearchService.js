// services/busSearchService.js

export class BusSearchService {
  constructor(baseURL = import.meta.env.VITE_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Find buses along a route from point A to point B
   * This searches for buses that have route points near the from/to locations
   */
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
          totalFound: routeBuses.length
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
   * Find buses near a specific location
   */
  async findNearbyBuses(coords, radius = 1000) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/v1/get/search?lat=${coords.lat}&lng=${coords.lon}&radius=${radius}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buses = await response.json();
      
      // Add distance calculation to each bus
      return buses.map(bus => ({
        ...bus,
        distanceFromSearch: this.calculateDistance(
          coords.lat, 
          coords.lon, 
          bus.location.coordinates[1], // lat
          bus.location.coordinates[0]  // lng
        )
      })).sort((a, b) => a.distanceFromSearch - b.distanceFromSearch);

    } catch (error) {
      console.error('Error finding nearby buses:', error);
      throw error;
    }
  }

  /**
   * Find buses that have routes connecting the from and to points
   */
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
      if (point.coordinates && point.coordinates.length >= 2) {
        const [lng, lat] = point.coordinates;
        
        const distanceFromStart = this.calculateDistance(
          fromCoords.lat, fromCoords.lon, lat, lng
        );
        const distanceFromEnd = this.calculateDistance(
          toCoords.lat, toCoords.lon, lat, lng
        );
        
        if (distanceFromStart <= threshold) nearFrom = true;
        if (distanceFromEnd <= threshold) nearTo = true;
      }
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
      if (point.coordinates && point.coordinates.length >= 2) {
        const [lng, lat] = point.coordinates;
        
        const distanceFromStart = this.calculateDistance(
          fromCoords.lat, fromCoords.lon, lat, lng
        );
        const distanceFromEnd = this.calculateDistance(
          toCoords.lat, toCoords.lon, lat, lng
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
      const response = await fetch(`${this.baseURL}/api/v1/bus/${deviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bus by ID:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const busSearchService = new BusSearchService();