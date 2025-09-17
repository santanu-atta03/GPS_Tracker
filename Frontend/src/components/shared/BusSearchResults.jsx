// components/search/BusSearchResults.jsx
import React from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  Navigation,
  Route,
  Zap 
} from 'lucide-react';

const BusCard = ({ bus, onBusSelect, searchType, searchMetadata }) => {
  const handleClick = () => {
    if (onBusSelect) {
      onBusSelect(bus);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on route':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'at stop':
      case 'stopped':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    } else {
      return `${(meters / 1000).toFixed(1)}km away`;
    }
  };

  const getRouteInfo = () => {
    if (bus.route && bus.route.length > 0) {
      // If route has named stops
      if (bus.route[0].name && bus.route[bus.route.length - 1].name) {
        return `${bus.route[0].name} → ${bus.route[bus.route.length - 1].name}`;
      }
      // If route only has coordinates
      return `${bus.route.length} stops`;
    }
    return 'Route information unavailable';
  };

  // Handle different possible data structures
  const deviceId = bus.deviceID || bus.deviceId || bus.id || 'Unknown';
  const busName = bus.name || bus.busName || `Bus ${deviceId}`;
  const busStatus = bus.status || 'Unknown';
  const driverName = bus.driverName || bus.driver;
  const currentLocation = bus.currentLocation || bus.location;
  const lastUpdated = bus.lastUpdated || bus.timestamp || bus.updatedAt;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-green-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">
              {busName}
            </h3>
            <p className="text-green-100 text-sm">{deviceId}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(busStatus)}`}>
              {busStatus}
            </span>
            {bus.distanceFromSearch && (
              <p className="text-green-100 text-xs mt-1">
                {formatDistance(bus.distanceFromSearch)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Route Information */}
        <div className="flex items-center text-gray-600">
          <Route className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
          <span className="text-sm">{getRouteInfo()}</span>
        </div>

        {/* Expected Time */}
        {bus.expectedTime && (
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-sm">Expected: {bus.expectedTime}</span>
          </div>
        )}

        {/* Driver Information */}
        {driverName && (
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-sm">{driverName}</span>
          </div>
        )}

        {/* Current Location */}
        {(bus.location || currentLocation) && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-sm">
              {currentLocation || 'Live location available'}
            </span>
          </div>
        )}

        {/* Coordinates Display for debugging */}
        {(bus.lat || bus.latitude) && (bus.lng || bus.longitude) && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-xs">
              Lat: {(bus.lat || bus.latitude)?.toFixed(6)}, 
              Lng: {(bus.lng || bus.longitude)?.toFixed(6)}
            </span>
          </div>
        )}

        {/* Route Match Score for route searches */}
        {bus.routeMatch && searchType === 'route' && (
          <div className="flex items-center text-gray-600">
            <Navigation className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <div className="text-xs">
              <div className={`inline-block px-2 py-1 rounded ${
                bus.routeMatch.isCorrectDirection ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {bus.routeMatch.isCorrectDirection ? 'Right direction' : 'Opposite direction'}
              </div>
              <span className="ml-2 text-gray-500">
                From: {Math.round(bus.routeMatch.fromDistance)}m, 
                To: {Math.round(bus.routeMatch.toDistance)}m
              </span>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 border-t pt-2 mt-3">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

const BusSearchResults = ({ 
  searchResults, 
  isLoading = false, 
  searchType = 'location', 
  searchMetadata = null,
  onBusSelect,
  error = null 
}) => {
  console.log("BusSearchResults - Error:", error);
  console.log("BusSearchResults - Results:", searchResults);
  console.log("BusSearchResults - Loading:", isLoading);
  console.log("BusSearchResults - Results type:", typeof searchResults, Array.isArray(searchResults));
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-gray-600">Searching for buses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">Search Error</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Ensure searchResults is always an array
  const resultsArray = Array.isArray(searchResults) ? searchResults : (searchResults ? [searchResults] : []);
  
  if (resultsArray.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">No buses found</h3>
        <p className="text-gray-500 mb-4">
          {searchType === 'route' 
            ? "No buses found for this route. Try searching with nearby locations or check back later."
            : searchType === 'busId'
            ? "No bus found with this ID. Please check the bus ID and try again."
            : "No buses found in this area. Try expanding your search radius or searching in a different location."
          }
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Refresh Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-green-100">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-lg font-semibold text-gray-800">
            {resultsArray.length} bus{resultsArray.length === 1 ? '' : 'es'} found
          </span>
        </div>
        {searchMetadata && searchMetadata.radius && (
          <span className="text-sm text-gray-500">
            Within {searchMetadata.radius}m radius
          </span>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {resultsArray.map((bus, index) => {
          const key = bus.deviceID || bus.deviceId || bus.id || index;
          return (
            <BusCard
              key={key}
              bus={bus}
              onBusSelect={onBusSelect}
              searchType={searchType}
              searchMetadata={searchMetadata}
            />
          );
        })}
      </div>

      {/* Search Metadata Footer */}
      {searchMetadata && (
        <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          {searchType === 'location' && searchMetadata.coordinates && (
            <p>
              Searched near: {searchMetadata.coordinates.lat?.toFixed(6)}, {searchMetadata.coordinates.lng?.toFixed(6)}
            </p>
          )}
          {searchType === 'route' && searchMetadata.routeInfo && (
            <p>
              Route search: {searchMetadata.routeInfo.from} → {searchMetadata.routeInfo.to}
            </p>
          )}
          {searchType === 'busId' && searchMetadata.deviceId && (
            <p>
              Bus ID search: {searchMetadata.deviceId}
            </p>
          )}
          <p className="mt-1">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default BusSearchResults;