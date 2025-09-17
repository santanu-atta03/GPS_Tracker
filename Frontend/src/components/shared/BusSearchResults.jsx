// components/search/BusSearchResults.jsx
import React from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  Navigation,
  Route,
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Phone,
  Activity 
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
      return `${bus.route.length} route points`;
    }
    return 'Route information unavailable';
  };

  const getRouteMatchInfo = () => {
    if (!bus.routeMatch && !bus.routeAnalysis) return null;
    
    const analysis = bus.routeMatch || bus.routeAnalysis;
    
    if (analysis.passesThrough) {
      return {
        type: 'passes-through',
        text: 'Passes through your route',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle
      };
    }
    
    if (analysis.isCorrectDirection && analysis.score > 0.3) {
      return {
        type: 'good-direction',
        text: 'Goes in your direction',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: ArrowRight
      };
    }
    
    if (analysis.score > 0.2) {
      return {
        type: 'nearby',
        text: 'Nearby route',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: TrendingUp
      };
    }
    
    return null;
  };

  const getRelevanceScore = () => {
    const analysis = bus.routeMatch || bus.routeAnalysis;
    if (!analysis || analysis.score === undefined) return null;
    
    const percentage = Math.round(analysis.score * 100);
    if (percentage < 20) return null;
    
    return {
      score: percentage,
      color: percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-blue-600' : 'text-orange-600'
    };
  };

  // Handle different possible data structures
  const deviceId = bus.deviceID || bus.deviceId || bus.id || 'Unknown';
  const busName = bus.name || bus.busName || `Bus ${deviceId}`;
  const busStatus = bus.status || 'Unknown';
  const driverName = bus.driverName || bus.driver;
  const driverPhone = bus.driverPhone;
  const currentLocation = bus.currentLocation || bus.location;
  const lastUpdated = bus.lastUpdated || bus.timestamp || bus.updatedAt;
  const routeMatchInfo = getRouteMatchInfo();
  const relevanceScore = getRelevanceScore();

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
            {relevanceScore && (
              <p className={`text-xs mt-1 font-medium ${relevanceScore.color === 'text-green-600' ? 'text-green-200' : 'text-green-100'}`}>
                {relevanceScore.score}% match
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Route Match Info */}
        {routeMatchInfo && (
          <div className={`flex items-center p-2 rounded-lg ${routeMatchInfo.bgColor}`}>
            <routeMatchInfo.icon className={`w-4 h-4 mr-2 ${routeMatchInfo.color} flex-shrink-0`} />
            <span className={`text-sm font-medium ${routeMatchInfo.color}`}>
              {routeMatchInfo.text}
            </span>
          </div>
        )}

        {/* Route Information */}
        <div className="flex items-center text-gray-600">
          <Route className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
          <span className="text-sm">{getRouteInfo()}</span>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
          {bus.startTime && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
              <span>Start: {bus.startTime}</span>
            </div>
          )}
          {bus.expectedTime && (
            <div className="flex items-center">
              <Activity className="w-3 h-3 mr-2 text-blue-500 flex-shrink-0" />
              <span>Expected: {bus.expectedTime}</span>
            </div>
          )}
          {bus.destinationTime && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2 text-orange-500 flex-shrink-0" />
              <span>End: {bus.destinationTime}</span>
            </div>
          )}
        </div>

        {/* Driver Information */}
        <div className="space-y-1">
          {driverName && (
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span className="text-sm">{driverName}</span>
            </div>
          )}
          {driverPhone && driverPhone !== 'Contact Support' && driverPhone !== '+91-9876543210' && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span className="text-sm">{driverPhone}</span>
            </div>
          )}
        </div>

        {/* Current Location */}
        {(bus.location || currentLocation) && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-sm">
              {currentLocation || 'Live location available'}
            </span>
          </div>
        )}

        {/* Route Match Details for Route Search */}
        {searchType === 'route' && (bus.routeMatch || bus.routeAnalysis) && (
          <div className="border-t pt-3 mt-3">
            <div className="text-xs text-gray-600 space-y-1">
              {(bus.routeMatch || bus.routeAnalysis).fromDistance < Infinity && (
                <div className="flex justify-between">
                  <span>Distance from start:</span>
                  <span className="font-medium">{formatDistance((bus.routeMatch || bus.routeAnalysis).fromDistance)}</span>
                </div>
              )}
              {(bus.routeMatch || bus.routeAnalysis).toDistance < Infinity && (
                <div className="flex justify-between">
                  <span>Distance to destination:</span>
                  <span className="font-medium">{formatDistance((bus.routeMatch || bus.routeAnalysis).toDistance)}</span>
                </div>
              )}
              {(bus.routeMatch || bus.routeAnalysis).isCorrectDirection !== undefined && (
                <div className="flex justify-between">
                  <span>Direction:</span>
                  <span className={`font-medium ${(bus.routeMatch || bus.routeAnalysis).isCorrectDirection ? 'text-green-600' : 'text-orange-600'}`}>
                    {(bus.routeMatch || bus.routeAnalysis).isCorrectDirection ? 'Correct' : 'Opposite'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Metadata */}
        {(bus.hasRoute !== undefined || bus.routePoints !== undefined) && (
          <div className="border-t pt-2 mt-2 text-xs text-gray-500">
            {bus.hasRoute && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                Has Route Data
              </span>
            )}
            {bus.routePoints > 0 && (
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                {bus.routePoints} Points
              </span>
            )}
          </div>
        )}

        {/* Debug: Coordinates Display */}
        {(bus.lat || bus.latitude) && (bus.lng || bus.longitude) && process.env.NODE_ENV === 'development' && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-xs">
              Lat: {(bus.lat || bus.latitude)?.toFixed(6)}, 
              Lng: {(bus.lng || bus.longitude)?.toFixed(6)}
            </span>
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
        <span className="ml-4 text-gray-600">
          {searchType === 'route' ? 'Analyzing routes...' : 'Searching for buses...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">Search Error</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
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
            ? "No buses found along this route. This could mean buses aren't currently operating on this path, or try searching with locations that have more bus coverage."
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
        
        {searchType === 'route' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
            <h4 className="font-medium text-blue-800 mb-2">Search Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Try searching from bus stops or major landmarks</li>
              <li>• Make sure your locations have good bus coverage</li>
              <li>• Consider nearby alternative routes</li>
              <li>• Check if buses operate at the current time</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Categorize buses for route search
  let categorizedBuses = resultsArray;
  if (searchType === 'route') {
    const passingThrough = resultsArray.filter(bus => 
      (bus.routeMatch || bus.routeAnalysis)?.passesThrough
    );
    const correctDirection = resultsArray.filter(bus => 
      (bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection && 
      !(bus.routeMatch || bus.routeAnalysis)?.passesThrough
    );
    const nearby = resultsArray.filter(bus => 
      !(bus.routeMatch || bus.routeAnalysis)?.passesThrough && 
      !(bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection
    );
    
    categorizedBuses = [...passingThrough, ...correctDirection, ...nearby];
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
          {searchType === 'route' && (
            <span className="text-sm text-gray-500 ml-2">
              (along or near your route)
            </span>
          )}
        </div>
        {searchMetadata && (
          <div className="text-sm text-gray-500 text-right">
            {searchMetadata.radius && (
              <div>Within {(searchMetadata.radius/1000).toFixed(1)}km radius</div>
            )}
            {searchMetadata.totalScanned && (
              <div className="text-xs">Analyzed {searchMetadata.totalScanned} buses</div>
            )}
          </div>
        )}
      </div>

      {/* Route Search Categories */}
      {searchType === 'route' && (
        <div className="grid gap-2 text-sm">
          {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.passesThrough).length > 0 && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>
                {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.passesThrough).length} bus(es) pass through your route
              </span>
            </div>
          )}
          {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection && !(bus.routeMatch || bus.routeAnalysis)?.passesThrough).length > 0 && (
            <div className="flex items-center text-blue-600">
              <ArrowRight className="w-4 h-4 mr-2" />
              <span>
                {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection && !(bus.routeMatch || bus.routeAnalysis)?.passesThrough).length} bus(es) go in your direction
              </span>
            </div>
          )}
          {resultsArray.filter(bus => !(bus.routeMatch || bus.routeAnalysis)?.passesThrough && !(bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection).length > 0 && (
            <div className="flex items-center text-orange-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>
                {resultsArray.filter(bus => !(bus.routeMatch || bus.routeAnalysis)?.passesThrough && !(bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection).length} nearby bus(es)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorizedBuses.map((bus, index) => (
          <BusCard
            key={bus.deviceID || bus.deviceId || bus.id || index}
            bus={bus}
            onBusSelect={onBusSelect}
            searchType={searchType}
            searchMetadata={searchMetadata}
          />
        ))}
      </div>

      {/* Search Metadata Footer */}
      {searchMetadata && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {searchMetadata.searchLocation && (
              <div>
                <span className="font-medium">Search Center:</span>
                <div className="text-xs">
                  {searchMetadata.searchLocation.latitude?.toFixed(4)}, {searchMetadata.searchLocation.longitude?.toFixed(4)}
                </div>
              </div>
            )}
            {searchMetadata.fromLocation && searchMetadata.toLocation && (
              <div className="md:col-span-2">
                <span className="font-medium">Route:</span>
                <div className="text-xs">
                  From: {searchMetadata.fromLocation.lat?.toFixed(4)}, {searchMetadata.fromLocation.lng?.toFixed(4)}
                </div>
                <div className="text-xs">
                  To: {searchMetadata.toLocation.lat?.toFixed(4)}, {searchMetadata.toLocation.lng?.toFixed(4)}
                </div>
              </div>
            )}
            {searchMetadata.searchTime && (
              <div>
                <span className="font-medium">Search Time:</span>
                <div className="text-xs">{new Date(searchMetadata.searchTime).toLocaleTimeString()}</div>
              </div>
            )}
          </div>
          
          {searchType === 'route' && searchMetadata.fromBusesCount !== undefined && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
              Search Stats: {searchMetadata.fromBusesCount} near start, {searchMetadata.toBusesCount} near destination, {searchMetadata.routeBusesCount} relevant
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusSearchResults;