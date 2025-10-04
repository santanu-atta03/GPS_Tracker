// FllowBusMap.jsx

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

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
    return <div>Loading map data...</div>;
  }

  const { pathCoordinates, pathAddresses, busesUsed } = path;

  const center = pathCoordinates[0]; // Map center

  // Utility to extract street or place name from full address
  const extractStreetOrPlace = (fullAddress) => {
    const parts = fullAddress.split(",");
    return parts.length >= 2 ? parts.slice(0, 2).join(", ") : fullAddress;
  };

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Draw route from first to last coordinate */}
      <Routing pathCoordinates={pathCoordinates} />

      {/* Place intermediate address markers */}
      {pathAddresses.slice(1, -1).map((loc, idx) => (
        <Marker key={idx} position={loc.coordinates}>
          <Popup>{extractStreetOrPlace(loc.address)}</Popup>
        </Marker>
      ))}

      {/* Bus Info Markers */}
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
                <strong>Next Start:</strong>{" "}
                {bus.nextStartTime?.startTime || "N/A"} -{" "}
                {bus.nextStartTime?.endTime || "N/A"}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default FllowBusMap;
