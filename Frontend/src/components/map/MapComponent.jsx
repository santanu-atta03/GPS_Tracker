import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
  Circle
} from 'react-leaflet';
import L from 'leaflet';

// Custom Bus Icon (more realistic)
const busIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(45deg, #3b82f6, #1d4ed8);
      border: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 18px;
      animation: bounce 2s infinite;
    ">
      🚌
    </div>
    <style>
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-8px); }
        60% { transform: translateY(-4px); }
      }
    </style>
  `,
  className: 'custom-bus-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Start Point Icon (Green with house emoji)
const startIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(45deg, #10b981, #059669);
      border: 3px solid white;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(16, 185, 129, 0.4);
      font-size: 16px;
    ">
      🏁
    </div>
  `,
  className: 'custom-start-marker',
  iconSize: [35, 35],
  iconAnchor: [17.5, 17.5],
  popupAnchor: [0, -17.5]
});

// End/Destination Point Icon (Red with flag)
const endIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(45deg, #ef4444, #dc2626);
      border: 3px solid white;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(239, 68, 68, 0.4);
      font-size: 16px;
    ">
      🎯
    </div>
  `,
  className: 'custom-end-marker',
  iconSize: [35, 35],
  iconAnchor: [17.5, 17.5],
  popupAnchor: [0, -17.5]
});

// Route point icon (small dot for route updates)
const routePointIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(45deg, #8b5cf6, #7c3aed);
      border: 2px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
    "></div>
  `,
  className: 'custom-route-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

// Fit bounds component
const FitBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) return;
    try {
      const bounds = L.latLngBounds(positions);
      // Fit bounds with more padding and minimum zoom for street details
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 16 // Ensure we can see street names
      });
    } catch (error) {
      console.error('Error fitting bounds:', error);
    }
  }, [positions, map]);

  return null;
};

// Component to update map view when bus moves
const UpdateMapView = ({ currentLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation && currentLocation.length === 2) {
      // Smoothly pan to new location and adjust zoom for street detail
      map.setView(currentLocation, 16, { animate: true, duration: 1 });
    }
  }, [currentLocation, map]);

  return null;
};

const MapComponent = ({ routeCoords, currentLocation, busId, busData }) => {
  const [routeHistory, setRouteHistory] = useState([]);
  

  // Process route data - Fixed for your data structure
  useEffect(() => {
    if (!routeCoords || !Array.isArray(routeCoords)) {
      // If routeCoords is not provided, try to get it from busData
      if (busData && busData.route && Array.isArray(busData.route)) {
        const processedRoute = busData.route
          .map((point, index) => {
            if (!point.coordinates || point.coordinates.length < 2) return null;
            
            // Your coordinates are already in [lat, lng] format, so use them directly
            const [lat, lng] = point.coordinates;
            
            // console.log(`Route Point ${index + 1} - Lat: ${lat}, Lng: ${lng}`);
            
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              console.warn('Invalid coordinates:', { lat, lng });
              return null;
            }
            
            return {
              position: [lat, lng], // Leaflet expects [lat, lng]
              timestamp: point.timestamp,
              _id: point._id || `route_${index}`
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        setRouteHistory(processedRoute);
        // console.log("Processed Route History:", processedRoute);
      } else {
        setRouteHistory([]);
      }
      return;
    }

    // Process routeCoords if provided directly
    const processedRoute = routeCoords
      .map((point, index) => {
        if (!point.coordinates || point.coordinates.length < 2) return null;
        
        // Assuming coordinates are in [lat, lng] format based on your data
        const [lat, lng] = point.coordinates;
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn('Invalid coordinates:', { lat, lng });
          return null;
        }
        
        return {
          position: [lat, lng],
          timestamp: point.timestamp,
          _id: point._id || `route_${index}`
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    setRouteHistory(processedRoute);
  }, [routeCoords, busData]);

  // Convert current location - Fixed for your data structure
  const convertedCurrentLocation = React.useMemo(() => {
    let location = currentLocation;
    
    // If currentLocation is not provided, try to get it from busData
    if (!location && busData && busData.location && busData.location.coordinates) {
      location = busData.location.coordinates;
    }
    
    if (!location || !Array.isArray(location) || location.length < 2) {
      return null;
    }
    
    // Your coordinates are in [lat, lng] format
    const [lat, lng] = location;
    // console.log("Current Location - Lat:", lat, "Lng:", lng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('Invalid current location:', { lat, lng });
      return null;
    }
    
    return [lat, lng]; // Leaflet expects [lat, lng]
  }, [currentLocation, busData]);

  // Get route positions for polyline
  const routePositions = routeHistory.map(point => point.position);

  // Create complete route including current location
  const allPositions = React.useMemo(() => {
    let positions = [...routePositions];
    
    if (convertedCurrentLocation) {
      const lastRoutePoint = positions[positions.length - 1];
      if (!lastRoutePoint) {
        positions = [convertedCurrentLocation];
      } else {
        // Check if current location is significantly different from last route point
        const distance = Math.sqrt(
          Math.pow(lastRoutePoint[0] - convertedCurrentLocation[0], 2) +
          Math.pow(lastRoutePoint[1] - convertedCurrentLocation[1], 2)
        );
        
        if (distance > 0.0001) { // ~10 meters threshold
          positions.push(convertedCurrentLocation);
        }
      }
    }
    
    // console.log("All Positions for Route:", positions);
    return positions;
  }, [routePositions, convertedCurrentLocation]);

  // Get start and end points
  const startPoint = routePositions[0];
  const endPoint = convertedCurrentLocation || routePositions[routePositions.length - 1];

  // Default center for map (Kolkata coordinates as fallback)
  const mapCenter = convertedCurrentLocation || startPoint || [22.5726, 88.3639];


  if (!busData && !currentLocation && (!routeCoords || routeCoords.length === 0)) {
    return (
      <div className="flex items-center justify-center h-72 bg-gray-100 rounded-xl">
        <p className="text-gray-500">No route data available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={mapCenter}
        zoom={startPoint ? 14 : 12}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ 
          height: '450px', 
          width: '100%', 
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}
        className="leaflet-container"
      >
        {/* ESRI World Street Map - Best for street names */}
        {/* <TileLayer
          attribution='&copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
          url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          maxZoom={19}
        /> */}

        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds to show entire route */}
        {allPositions.length > 0 && <FitBounds positions={allPositions} />}

        {/* Update map view when bus moves */}
        <UpdateMapView currentLocation={convertedCurrentLocation} />

        {/* Route Line - Shows the path the bus has traveled */}
        {allPositions.length > 1 && (
          <>
            {/* Background route line (wider, lighter) */}
            <Polyline
              positions={allPositions}
              color="#ffffff"
              weight={8}
              opacity={0.8}
            />
            {/* Main route line */}
            <Polyline
              positions={allPositions}
              color="#3b82f6"
              weight={5}
              opacity={0.9}
            />
            {/* Active route line (animated effect) */}
            <Polyline
              positions={allPositions}
              color="#10b981"
              weight={3}
              opacity={1}
            />
          </>
        )}

        {/* Route History Points - Small markers for each route update */}
        {routeHistory.map((point, index) => (
          <Marker
            key={point._id || index}
            position={point.position}
            icon={routePointIcon}
          >
            <Popup>
              <div className="text-sm bg-white rounded-lg p-3 shadow-lg">
                <p className="font-semibold text-purple-600">📍 Route Update #{index + 1}</p>
                <p className="text-gray-600">⏰ {new Date(point.timestamp).toLocaleString()}</p>
                <p className="text-gray-500 text-xs">📍 Lat: {point.position[0].toFixed(6)}, Lng: {point.position[1].toFixed(6)}</p>
                <p className="text-xs text-gray-400 mt-1">Bus location when route was updated</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Start Point Marker */}
        {startPoint && (
          <Marker position={startPoint} icon={startIcon}>
            <Popup>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[200px]">
                <h3 className="font-bold text-green-600 mb-2">🚏 Journey Start</h3>
                <p className="text-sm text-gray-700"><strong>Bus ID:</strong> {busId}</p>
                <p className="text-sm text-gray-600">📍 Lat: {startPoint[0].toFixed(6)}, Lng: {startPoint[1].toFixed(6)}</p>
                <p className="text-xs text-gray-500 mt-2">This is where the journey began</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current Bus Location Marker */}
        {convertedCurrentLocation && (
          <Marker position={convertedCurrentLocation} icon={busIcon}>
            <Popup>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[220px]">
                <h3 className="font-bold text-blue-600 mb-2">🚌 Live Bus Location</h3>
                <p className="text-sm text-gray-700"><strong>Bus ID:</strong> {busId}</p>
                <p className="text-sm text-gray-600">📍 Lat: {convertedCurrentLocation[0].toFixed(6)}, Lng: {convertedCurrentLocation[1].toFixed(6)}</p>
                <p className="text-xs text-gray-500 mb-2">Last Updated: {busData?.lastUpdated ? new Date(busData.lastUpdated).toLocaleString() : 'Unknown'}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Currently Active</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Enhanced Route Statistics Overlay */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-gray-200 min-w-[200px]">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
          📊 Journey Stats
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Route Points</span>
            </div>
            <span className="text-sm font-medium text-gray-800">{routeHistory.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Updates</span>
            </div>
            <span className="text-sm font-medium text-gray-800">{routeHistory.length}</span>
          </div>
          <hr className="border-gray-200 my-2" />
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Est. Distance:</span>
              <span className="font-medium">~{(allPositions.length * 0.5).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Route Updates:</span>
              <span className="font-medium">{routeHistory.length}</span>
            </div>
            {busData?.lastUpdated && (
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span className="font-medium">{new Date(busData.lastUpdated).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200">
        <div className="flex flex-col space-y-2">
          <div className="text-xs text-gray-600 font-medium mb-2">Map Controls</div>
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Route Path</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>Updates</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Live Position</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;