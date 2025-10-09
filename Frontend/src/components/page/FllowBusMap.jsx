import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import Navbar from "../shared/Navbar";
// ✅ Fix for missing default Leaflet marker icons on Vercel
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Routing Control Component
const Routing = ({ pathCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: pathCoordinates.map((coords) => L.latLng(...coords)),
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      lineOptions: {
        styles: [{ color: "blue", weight: 3 }],
      },
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [pathCoordinates, map]);

  return null;
};

// User icon for the map
const userIcon = L.icon({
  iconUrl:
    "https://www.citypng.com/public/uploads/preview/red-gps-location-symbol-icon-hd-png-701751695035446zkphf8tfr3.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Bus icon for the timeline (inline SVG)
const TimelineBusIcon = () => (
  <div
    style={{
      backgroundColor: "#16a34a",
      color: "white",
      fontSize: 20,
      width: 32,
      height: 32,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "3px solid white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    }}
  >
    🚌
  </div>
);

// Haversine formula to calculate distance between two lat/lon points in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371e3; // Earth radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

// Find closest step index of userLocation on pathCoordinates
const getUserStepIndex = (userLocation, pathCoordinates) => {
  if (!userLocation) return null;

  const distances = pathCoordinates.map(([lat, lon]) =>
    getDistance(userLocation[0], userLocation[1], lat, lon)
  );

  // Find minimum distance and corresponding index
  const minDistance = Math.min(...distances);
  let closestIndex = distances.indexOf(minDistance);

  // Distances to start and end points for snapping logic
  const distToStart = getDistance(
    userLocation[0],
    userLocation[1],
    ...pathCoordinates[0]
  );
  const distToEnd = getDistance(
    userLocation[0],
    userLocation[1],
    ...pathCoordinates[pathCoordinates.length - 1]
  );

  // Define snapping thresholds (meters)
  const snapThreshold = 100; // within 100m considered at start or end

  if (distToStart < snapThreshold) return 0;
  if (distToEnd < snapThreshold) return pathCoordinates.length - 1;

  // If user is beyond start (before the first step latitude)
  if (userLocation[0] < pathCoordinates[0][0] - 0.001) return 0;

  // If user is beyond end (after the last step latitude)
  if (userLocation[0] > pathCoordinates[pathCoordinates.length - 1][0] + 0.001)
    return pathCoordinates.length - 1;

  return closestIndex;
};

const FllowBusMap = () => {
  const { path, darktheme } = useSelector((store) => store.auth);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (err) => {
        console.error("Error getting location", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!path || !path.pathCoordinates || path.pathCoordinates.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
      >
        <div
          className={`text-center ${
            darktheme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Loading map data...
        </div>
      </div>
    );
  }

  const { pathCoordinates, pathAddresses, busesUsed } = path;
  const center = pathCoordinates[0];
  const userStepIndex = getUserStepIndex(userLocation, pathCoordinates);

  const extractStreetOrPlace = (fullAddress) => {
    const parts = fullAddress.split(",");
    return parts.length >= 2 ? parts.slice(0, 2).join(", ") : fullAddress;
  };

  return (
    <>
      <div
        className={`w-full min-h-screen ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
      >
        <Navbar />
        <div className="flex justify-center items-center pt-8">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: "70vh", width: "80%" }}
          >
            <TileLayer
              url={
                darktheme
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Routing pathCoordinates={pathCoordinates} />

            {/* Address Markers */}
            {pathAddresses.slice(1, -1).map((loc, idx) => (
              <Marker key={idx} position={loc.coordinates}>
                <Popup>{extractStreetOrPlace(loc.address)}</Popup>
              </Marker>
            ))}

            {/* Bus Markers */}
            {busesUsed.map((bus, idx) => {
              const coordIndex =
                idx < pathCoordinates.length ? idx : pathCoordinates.length - 1;
              return (
                <Marker
                  key={`bus-${idx}`}
                  position={pathCoordinates[coordIndex]}
                >
                  <Popup>
                    <div>
                      <strong>Bus Name:</strong> {bus.name}
                      <br />
                      <strong>From:</strong> {bus.from}
                      <br />
                      <strong>To:</strong> {bus.to}
                      <br />
                      <strong>Time:</strong> {bus.nextStartTime?.startTime} to{" "}
                      {bus.nextStartTime?.endTime}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* User Location Marker */}
            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        {/* Map Section */}

        {/* Vertical Journey Timeline */}
        <div className="w-full mt-10 pb-10 flex justify-center">
          <div
            className={`relative border-l-4 pl-6 ${
              darktheme ? "border-gray-600" : "border-gray-300"
            }`}
          >
            {pathAddresses.map((addr, idx) => {
              const isStart = idx === 0;
              const isEnd = idx === pathAddresses.length - 1;
              const hasBus = busesUsed[idx];
              const showBusIcon = userStepIndex === idx;

              // Skip rendering if it's not start/end and there's no bus and user is not here
              if (!isStart && !isEnd && !hasBus && !showBusIcon) return null;

              return (
                <div
                  key={`step-${idx}`}
                  className={`flex flex-col items-start space-y-2 relative border-l-2 pl-6 pb-8 ${
                    darktheme ? "border-gray-600" : "border-gray-300"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute -left-1 top-1"></div>

                  {/* User Bus Icon */}
                  {showBusIcon && (
                    <div
                      className="absolute -left-8 top-0"
                      title="Your location"
                    >
                      <TimelineBusIcon />
                    </div>
                  )}

                  {/* Label */}
                  <div
                    className={`text-sm font-semibold ${
                      darktheme ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {isStart ? "Start" : isEnd ? "Destination" : "Change Here"}
                  </div>

                  {/* Address */}
                  {(isStart || isEnd || hasBus) && (
                    <div
                      className={`text-sm max-w-md ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {addr.address}
                    </div>
                  )}

                  {/* Bus Info */}
                  {hasBus && (
                    <div
                      className={`border-2 rounded-xl p-4 shadow-md w-full text-sm ${
                        darktheme
                          ? "bg-gray-800 border-green-600"
                          : "bg-white border-green-400"
                      }`}
                    >
                      <div
                        className={`font-semibold text-lg mb-1 ${
                          darktheme ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Bus: {busesUsed[idx].name}
                      </div>
                      <div
                        className={`mb-1 ${
                          darktheme ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        <span className="font-semibold">Route:</span>{" "}
                        {busesUsed[idx].from} → {busesUsed[idx].to}
                      </div>
                      <div
                        className={`mb-1 ${
                          darktheme ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        <span className="font-semibold">Device:</span>{" "}
                        {busesUsed[idx].deviceID}
                      </div>
                      <div
                        className={
                          darktheme ? "text-gray-300" : "text-gray-800"
                        }
                      >
                        <span className="font-semibold">Time:</span>{" "}
                        {busesUsed[idx].nextStartTime?.startTime} to{" "}
                        {busesUsed[idx].nextStartTime?.endTime}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default FllowBusMap;
