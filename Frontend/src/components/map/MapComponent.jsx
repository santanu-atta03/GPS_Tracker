// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Search, 
//   ArrowUpDown, 
//   MapPin, 
//   Clock, 
//   User, 
//   Navigation, 
//   ChevronLeft, 
//   Zap, 
//   Route, 
//   AlertCircle 
// } from 'lucide-react';



// const routes = [
//   { from: 'Kolkata Station', to: 'Barrackpore', buses: ['BUS001'] },
//   { from: 'Esplanade', to: 'Sealdah', buses: ['BUS002'] },
//   { from: 'Park Street', to: 'Dumdum', buses: ['BUS001', 'BUS002'] }
// ];

// // Simple Map Component (using SVG for demonstration)
// const MapComponent = ({ route, currentLocation, busId }) => {
//   const mapRef = useRef(null);
//   const [animatedPosition, setAnimatedPosition] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setAnimatedPosition(prev => (prev + 1) % 100);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="relative w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl overflow-hidden border-2 border-green-100">
//       <svg width="100%" height="100%" viewBox="0 0 400 200" className="absolute inset-0">
//         {/* Background grid */}
//         <defs>
//           <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
//             <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
//           </pattern>
//         </defs>
//         <rect width="100%" height="100%" fill="url(#grid)" />
        
//         {/* Route line */}
//         {route && route.length > 1 && (
//           <polyline
//             points={route.map((point, i) => `${50 + i * 80},${100 + Math.sin(i) * 30}`).join(' ')}
//             fill="none"
//             stroke="#10b981"
//             strokeWidth="4"
//             strokeDasharray="5,5"
//           />
//         )}
        
//         {/* Route points */}
//         {route && route.map((point, index) => (
//           <g key={index}>
//             <circle
//               cx={50 + index * 80}
//               cy={100 + Math.sin(index) * 30}
//               r="6"
//               fill={index === 0 ? "#ef4444" : index === route.length - 1 ? "#10b981" : "#3b82f6"}
//               stroke="white"
//               strokeWidth="2"
//             />
//             <text
//               x={50 + index * 80}
//               y={85 + Math.sin(index) * 30}
//               textAnchor="middle"
//               className="text-xs fill-gray-700 font-medium"
//             >
//               {point.name}
//             </text>
//           </g>
//         ))}
        
//         {/* Animated bus */}
//         {route && route.length > 1 && (
//           <g>
//             <circle
//               cx={50 + (animatedPosition / 100) * (route.length - 1) * 80}
//               cy={100 + Math.sin((animatedPosition / 100) * (route.length - 1)) * 30}
//               r="8"
//               fill="#fbbf24"
//               stroke="#f59e0b"
//               strokeWidth="2"
//             />
//             <text
//               x={50 + (animatedPosition / 100) * (route.length - 1) * 80}
//               y={105 + Math.sin((animatedPosition / 100) * (route.length - 1)) * 30}
//               textAnchor="middle"
//               className="text-xs fill-white font-bold"
//             >
//               🚌
//             </text>
//           </g>
//         )}
//       </svg>
      
//       <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium text-gray-700">
//         Live Tracking
//       </div>
//     </div>
//   );
// };

// export default MapComponent

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
import markerIconPng from 'leaflet/dist/images/marker-icon.png';

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

// Fit bounds component
const FitBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) return;
    try {
      const bounds = L.latLngBounds(positions);
      // Fit bounds with more padding and minimum zoom for street details
      map.fitBounds(bounds, { 
        padding: [30, 30],
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

const MapComponent = ({ routeCoords, currentLocation, busId }) => {
  const [routeHistory, setRouteHistory] = useState([]);

  // Process route data
  useEffect(() => {
    if (!routeCoords || !Array.isArray(routeCoords)) {
      setRouteHistory([]);
      return;
    }

    // Convert route coordinates from [lng, lat] to [lat, lng] for Leaflet
    const processedRoute = routeCoords
      .map(point => {
        if (!point.coordinates || point.coordinates.length < 2) return null;
        const [lng, lat] = point.coordinates;
        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn('Invalid coordinates:', { lat, lng });
          return null;
        }
        return {
          position: [lat, lng],
          timestamp: point.timestamp,
          _id: point._id
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by timestamp

    setRouteHistory(processedRoute);
  }, [routeCoords]);

  // Convert current location
  const convertedCurrentLocation = React.useMemo(() => {
    if (!currentLocation || !Array.isArray(currentLocation) || currentLocation.length < 2) {
      return null;
    }
    const [lng, lat] = currentLocation;
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('Invalid current location:', { lat, lng });
      return null;
    }
    return [lat, lng];
  }, [currentLocation]);

  // Get route positions for polyline
  const routePositions = routeHistory.map(point => point.position);

  // Add current location to route if it's different from the last route point
  const allPositions = React.useMemo(() => {
    if (!convertedCurrentLocation) return routePositions;
    
    const lastRoutePoint = routePositions[routePositions.length - 1];
    if (!lastRoutePoint) return [convertedCurrentLocation];
    
    // Check if current location is significantly different from last route point
    const distance = Math.sqrt(
      Math.pow(lastRoutePoint[0] - convertedCurrentLocation[0], 2) +
      Math.pow(lastRoutePoint[1] - convertedCurrentLocation[1], 2)
    );
    
    if (distance > 0.0001) { // ~10 meters threshold
      return [...routePositions, convertedCurrentLocation];
    }
    
    return routePositions;
  }, [routePositions, convertedCurrentLocation]);

  // Get start and end points
  const startPoint = routePositions[0];
  const endPoint = convertedCurrentLocation || routePositions[routePositions.length - 1];

  // Default center for map
  const mapCenter = convertedCurrentLocation || startPoint || [22.5726, 88.3639]; // Default to Kolkata

  if (!routeCoords && !currentLocation) {
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
        zoom={16}
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
        {/* Multiple tile layer options for rich street details */}
        
        {/* Option 1: ESRI World Street Map - Best for street names */}
        <TileLayer
          attribution='&copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
          url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          maxZoom={19}
        />

        {/* Option 2: OpenStreetMap with higher zoom for street details - Uncomment to use instead */}
        {/* <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        /> */}

        {/* Option 3: CartoDB with labels - Clean modern look - Uncomment to use instead */}
        {/* <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        /> */}

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
              dashArray="10, 5"
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

        {/* Route History Points - Smaller, more subtle circles */}
        {routeHistory.map((point, index) => (
          <Circle
            key={point._id || index}
            center={point.position}
            radius={15}
            fillColor="#8b5cf6"
            color="#7c3aed"
            weight={2}
            opacity={0.6}
            fillOpacity={0.4}
          >
            <Popup>
              <div className="text-sm bg-white rounded-lg p-3 shadow-lg">
                <p className="font-semibold text-gray-800">📍 Route Point {index + 1}</p>
                <p className="text-gray-600">⏰ {new Date(point.timestamp).toLocaleString()}</p>
                <p className="text-gray-500 text-xs">📍 {point.position[0].toFixed(6)}, {point.position[1].toFixed(6)}</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Start Point Marker */}
        {startPoint && (
          <Marker position={startPoint} icon={startIcon}>
            <Popup>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[200px]">
                <h3 className="font-bold text-green-600 mb-2">🚏 Journey Start</h3>
                <p className="text-sm text-gray-700"><strong>Bus ID:</strong> {busId}</p>
                <p className="text-sm text-gray-600">📍 {startPoint[0].toFixed(6)}, {startPoint[1].toFixed(6)}</p>
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
                <p className="text-sm text-gray-600">📍 {convertedCurrentLocation[0].toFixed(6)}, {convertedCurrentLocation[1].toFixed(6)}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Currently Moving</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Point (if bus has completed route) */}
        {endPoint && endPoint !== convertedCurrentLocation && (
          <Marker position={endPoint} icon={endIcon}>
            <Popup>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[200px]">
                <h3 className="font-bold text-red-600 mb-2">🎯 Last Position</h3>
                <p className="text-sm text-gray-700"><strong>Bus ID:</strong> {busId}</p>
                <p className="text-sm text-gray-600">📍 {endPoint[0].toFixed(6)}, {endPoint[1].toFixed(6)}</p>
                <p className="text-xs text-gray-500 mt-2">Last known location</p>
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
              <span className="text-sm text-gray-700">Route Traveled</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Checkpoints</span>
            </div>
            <span className="text-sm font-medium text-gray-800">{routeHistory.length}</span>
          </div>
          <hr className="border-gray-200 my-2" />
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Distance:</span>
              <span className="font-medium">~{(allPositions.length * 0.3).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Speed:</span>
              <span className="font-medium">~45 km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200">
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => {/* Add zoom in functionality */}}
            className="w-8 h-8 bg-white hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 text-lg font-bold"
          >
            +
          </button>
          <button 
            onClick={() => {/* Add zoom out functionality */}}
            className="w-8 h-8 bg-white hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 text-lg font-bold"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;