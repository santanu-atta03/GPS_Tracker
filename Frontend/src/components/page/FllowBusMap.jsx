// FllowBusMap.jsx

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const Routing = ({ pathCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(...pathCoordinates[0]),
        L.latLng(...pathCoordinates[pathCoordinates.length - 1]),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [pathCoordinates, map]);

  return null;
};

const FllowBusMap = () => {
  const { path } = useSelector((store) => store.auth);

  if (!path || !path.pathCoordinates || path.pathCoordinates.length === 0) {
    return <div className="text-center text-gray-500">Loading map data...</div>;
  }

  const { pathCoordinates, pathAddresses, busesUsed } = path;
  const center = pathCoordinates[0];

  const extractStreetOrPlace = (fullAddress) => {
    const parts = fullAddress.split(",");
    return parts.length >= 2 ? parts.slice(0, 2).join(", ") : fullAddress;
  };

  return (
    <div className="w-full">
      {/* Map Section */}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "70vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
            <Marker key={`bus-${idx}`} position={pathCoordinates[coordIndex]}>
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
      </MapContainer>

      {/* Horizontal Journey Timeline */}
      {/* Vertical Journey Timeline */}
      <div className="w-full mt-10 flex justify-center">
        <div className="relative border-l-4 border-gray-300 pl-6">
          {pathAddresses.map((addr, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === pathAddresses.length - 1;
            const hasBus = busesUsed[idx];

            // Skip rendering if it's not start/end and there's no bus for this step
            if (!isStart && !isEnd && !hasBus) return null;

            return (
              <div
                key={`step-${idx}`}
                className="flex flex-col items-start space-y-2 relative border-l-2 border-gray-300 pl-6 pb-8"
              >
                {/* Timeline Dot */}
                <div className="w-3 h-3 bg-green-500 rounded-full absolute -left-1 top-1"></div>

                {/* Label */}
                <div className="text-sm font-semibold text-green-600">
                  {isStart ? "Start" : isEnd ? "Destination" : "Change Here"}
                </div>

                {/* Address */}
                {(isStart || isEnd || hasBus) && (
                  <div className="text-sm text-gray-700 max-w-md">
                    {addr.address}
                  </div>
                )}

                {/* Bus Info */}
                {hasBus && (
                  <div className="bg-white border-2 border-green-400 rounded-xl p-4 shadow-md w-full text-sm">
                    <div className="font-semibold text-lg mb-1">
                      Bus: {busesUsed[idx].name}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">Route:</span>{" "}
                      {busesUsed[idx].from} → {busesUsed[idx].to}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">Device:</span>{" "}
                      {busesUsed[idx].deviceID}
                    </div>
                    <div>
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
  );
};

export default FllowBusMap;
