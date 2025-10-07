import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const busIcon = new L.DivIcon({
  html: "🚌",
  className: "text-3xl",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function Routing({ path }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !path || path.length < 2) return;

    const route = L.Routing.control({
      waypoints: path.map((p) => L.latLng(p.coordinates[0], p.coordinates[1])),
      addWaypoints: false,
      lineOptions: { styles: [{ color: "blue", weight: 4 }] },
      show: false,
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(route);
  }, [map, path]);

  return null;
}

const BusDetailsPage2 = () => {
  const { deviceID } = useParams();
  const [bus, setBus] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/Myroute/bus-details/${deviceID}`
        );
        const data = await res.json();
        setBus(data);
      } catch (err) {
        console.error("Error fetching bus:", err);
      }
    };
    fetchBusData();
  }, [deviceID]);

  useEffect(() => {
    if (!bus?.timeSlots) return;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const active = bus.timeSlots.find(
      (slot) => currentTime >= slot.startTime && currentTime <= slot.endTime
    );
    setActiveSlot(active);
  }, [bus]);

  if (!bus)
    return <div className="p-6 text-center text-gray-600">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* 🔝 Header */}
      <div className="bg-blue-100 p-4 rounded-xl text-center shadow-md">
        <h2 className="text-2xl font-bold text-blue-700">
          Bus {bus.name} ({bus.deviceID})
        </h2>
        <p className="text-gray-600">
          Route: {bus.from} → {bus.to}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🕒 Time Slots */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3">Driver Details</h3>
          <div className="flex items-center space-x-3">
            <img
              src={bus.driver.picture}
              alt={bus.driver.name}
              className="w-16 h-16 rounded-full border"
            />
            <div>
              <p className="font-semibold">{bus.driver.name}</p>
              <p className="text-sm text-gray-600">{bus.driver.email}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-700">
            <p>License ID: {bus.driver.licenceId}</p>
            <p>Experience: {bus.driver.driverExp} years</p>
          </div>
        </div>

        {/* 🗺️ Map */}
        <div className="col-span-2 bg-white rounded-xl shadow-md p-2">
          <MapContainer
            center={bus.liveLocation.coordinates}
            zoom={14}
            style={{ height: "400px", width: "100%", borderRadius: "12px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Routing path={bus.path} />
            <Marker position={bus.liveLocation.coordinates} icon={busIcon}>
              <Popup>
                <b>Bus Live Location</b>
                <br />
                {bus.name}
              </Popup>
            </Marker>
          </MapContainer>

          {/* 📊 Stats Below Map */}
          <div className="flex flex-wrap justify-around mt-4 text-center text-sm text-gray-700">
            <div>
              Speed: <b>{bus.speed} km/h</b>
            </div>
            <div>
              Total Distance: <b>{bus.totalDistance} km</b>
            </div>
            <div>
              Covered: <b>{bus.coveredDistance} km</b>
            </div>
            <div>
              Remaining: <b>{bus.remainingDistance} km</b>
            </div>
            <div>
              ETA: <b>{bus.ETA}</b>
            </div>
          </div>
        </div>

        {/* 🧍 Driver Info */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3">Time Slots</h3>
          <ul className="space-y-2">
            {bus.timeSlots.map((slot) => (
              <li
                key={slot._id}
                className={`p-2 rounded-lg text-center font-medium ${
                  activeSlot && activeSlot._id === slot._id
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {slot.startTime} - {slot.endTime}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BusDetailsPage2;
