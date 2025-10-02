import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// Custom Bus Icon
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
  className: "custom-bus-marker",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Start Point Icon
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
  className: "custom-start-marker",
  iconSize: [35, 35],
  iconAnchor: [17.5, 17.5],
  popupAnchor: [0, -17.5],
});

// End/Destination Point Icon
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
  className: "custom-end-marker",
  iconSize: [35, 35],
  iconAnchor: [17.5, 17.5],
  popupAnchor: [0, -17.5],
});

// Route point icon
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
  className: "custom-route-marker",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

// Fit bounds component - removed zoom animations
const FitBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) return;
    try {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: false, // Disable animation
      });
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [positions, map]);

  return null;
};

// Component to update map view - removed zoom animations
const UpdateMapView = ({ currentLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation && currentLocation.length === 2) {
      map.panTo(currentLocation, { animate: false }); // Pan without animation, no zoom change
    }
  }, [currentLocation, map]);

  return null;
};

const MapComponent = ({ routeCoords, currentLocation, busId, busData }) => {
  const [routeHistory, setRouteHistory] = useState([]);

  useEffect(() => {
    if (!routeCoords || !Array.isArray(routeCoords)) {
      if (busData && busData.route && Array.isArray(busData.route)) {
        const processedRoute = busData.route
          .map((point, index) => {
            if (!point.coordinates || point.coordinates.length < 2) return null;

            const [lat, lng] = point.coordinates;

            if (
              isNaN(lat) ||
              isNaN(lng) ||
              lat < -90 ||
              lat > 90 ||
              lng < -180 ||
              lng > 180
            ) {
              console.warn("Invalid coordinates:", { lat, lng });
              return null;
            }

            return {
              position: [lat, lng],
              timestamp: point.timestamp,
              _id: point._id || `route_${index}`,
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        setRouteHistory(processedRoute);
      } else {
        setRouteHistory([]);
      }
      return;
    }

    const processedRoute = routeCoords
      .map((point, index) => {
        if (!point.coordinates || point.coordinates.length < 2) return null;

        const [lat, lng] = point.coordinates;

        if (
          isNaN(lat) ||
          isNaN(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          console.warn("Invalid coordinates:", { lat, lng });
          return null;
        }

        return {
          position: [lat, lng],
          timestamp: point.timestamp,
          _id: point._id || `route_${index}`,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    setRouteHistory(processedRoute);
  }, [routeCoords, busData]);

  const convertedCurrentLocation = React.useMemo(() => {
    let location = currentLocation;

    if (
      !location &&
      busData &&
      busData.location &&
      busData.location.coordinates
    ) {
      location = busData.location.coordinates;
    }

    if (!location || !Array.isArray(location) || location.length < 2) {
      return null;
    }

    const [lat, lng] = location;

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      console.warn("Invalid current location:", { lat, lng });
      return null;
    }

    return [lat, lng];
  }, [currentLocation, busData]);

  const routePositions = routeHistory.map((point) => point.position);

  const allPositions = React.useMemo(() => {
    let positions = [...routePositions];

    if (convertedCurrentLocation) {
      const lastRoutePoint = positions[positions.length - 1];
      if (!lastRoutePoint) {
        positions = [convertedCurrentLocation];
      } else {
        const distance = Math.sqrt(
          Math.pow(lastRoutePoint[0] - convertedCurrentLocation[0], 2) +
            Math.pow(lastRoutePoint[1] - convertedCurrentLocation[1], 2)
        );

        if (distance > 0.0001) {
          positions.push(convertedCurrentLocation);
        }
      }
    }

    return positions;
  }, [routePositions, convertedCurrentLocation]);

  const startPoint = routePositions[0];
  const endPoint =
    convertedCurrentLocation || routePositions[routePositions.length - 1];

  const mapCenter = convertedCurrentLocation || startPoint || [22.5726, 88.3639];

  if (
    !busData &&
    !currentLocation &&
    (!routeCoords || routeCoords.length === 0)
  ) {
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
        zoom={14}
        style={{
          height: "450px",
          width: "100%",
          borderRadius: "16px",
          border: "none",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
        className="leaflet-container"
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {allPositions.length > 0 && <FitBounds positions={allPositions} />}

        <UpdateMapView currentLocation={convertedCurrentLocation} />

        {allPositions.length > 1 && (
          <>
            <Polyline
              positions={allPositions}
              color="#ffffff"
              weight={8}
              opacity={0.8}
            />
            <Polyline
              positions={allPositions}
              color="#3b82f6"
              weight={5}
              opacity={0.9}
            />
            <Polyline
              positions={allPositions}
              color="#10b981"
              weight={3}
              opacity={1}
            />
          </>
        )}

        {routeHistory.map((point, index) => (
          <Marker
            key={point._id || index}
            position={point.position}
            icon={routePointIcon}
          >
            <Popup>
              <div className="text-sm bg-white rounded-lg p-3 shadow-lg">
                <p className="font-semibold text-purple-600">
                  📍 Route Update #{index + 1}
                </p>
                <p className="text-gray-600">
                  ⏰ {new Date(point.timestamp).toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs">
                  📍 Lat: {point.position[0].toFixed(6)}, Lng:{" "}
                  {point.position[1].toFixed(6)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Bus location when route was updated
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {startPoint && (
          <Marker position={startPoint} icon={startIcon}>
            <Popup>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[200px]">
                <h3 className="font-bold text-green-600 mb-2">
                  🚏 Journey Start
                </h3>
                <p className="text-sm text-gray-700">
                  <strong>Bus ID:</strong> {busId}
                </p>
                <p className="text-sm text-gray-600">
                  📍 Lat: {startPoint[0].toFixed(6)}, Lng:{" "}
                  {startPoint[1].toFixed(6)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This is where the journey began
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {convertedCurrentLocation && (
          <Marker position={convertedCurrentLocation} icon={busIcon}>
            <Popup>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[220px]">
                <h3 className="font-bold text-blue-600 mb-2">
                  🚌 Live Bus Location
                </h3>
                <p className="text-sm text-gray-700">
                  <strong>Bus ID:</strong> {busId}
                </p>
                <p className="text-sm text-gray-600">
                  📍 Lat: {convertedCurrentLocation[0].toFixed(6)}, Lng:{" "}
                  {convertedCurrentLocation[1].toFixed(6)}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Last Updated:{" "}
                  {busData?.lastUpdated
                    ? new Date(busData.lastUpdated).toLocaleString()
                    : "Unknown"}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">
                    Currently Active
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

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
            <span className="text-sm font-medium text-gray-800">
              {routeHistory.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Updates</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {routeHistory.length}
            </span>
          </div>
          <hr className="border-gray-200 my-2" />
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Est. Distance:</span>
              <span className="font-medium">
                ~{(allPositions.length * 0.5).toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span>Route Updates:</span>
              <span className="font-medium">{routeHistory.length}</span>
            </div>
            {busData?.lastUpdated && (
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span className="font-medium">
                  {new Date(busData.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200">
        <div className="flex flex-col space-y-2">
          <div className="text-xs text-gray-600 font-medium mb-2">
            Map Controls
          </div>
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