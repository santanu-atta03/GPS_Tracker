import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {
  MapPin,
  Clock,
  Gauge,
  Route as RouteIcon,
  User,
  Mail,
  CreditCard,
  Award,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";

// 🚌 Custom bus icon
const busIcon = new L.DivIcon({
  html: "🚌",
  className: "text-3xl",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// 🗺️ Routing component
function Routing({ path }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !path || path.length < 2) return;

    const route = L.Routing.control({
      waypoints: path.map((p) => L.latLng(p.coordinates[0], p.coordinates[1])),
      addWaypoints: false,
      lineOptions: { styles: [{ color: "blue", weight: 4 }] },
      show: false, // disable popup route summary
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(route);
  }, [map, path]);

  return null;
}

const BusDetailsPage2 = () => {
  const { deviceID } = useParams();
  const { darktheme } = useSelector((store) => store.auth);
  const [bus, setBus] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/Myroute/bus-details/${deviceID}`
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
    return (
      <>
        <div
          className={`min-h-screen flex items-center justify-center ${
            darktheme
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
              : "bg-gradient-to-br from-green-50 via-white to-green-100"
          }`}
        >
          <Navbar />
          <div
            className={`rounded-2xl shadow-xl p-8 flex flex-col items-center ${
              darktheme
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-green-100"
            }`}
          >
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
            <span
              className={`text-lg font-medium ${
                darktheme ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Loading bus details...
            </span>
          </div>
        </div>
      </>
    );

  return (
    <>
      <div
        className={`min-h-screen ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
      >
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`rounded-2xl shadow-lg p-6 ${
                darktheme
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-green-100"
              }`}
            >
              <h1
                className={`text-3xl font-bold mb-2 ${
                  darktheme ? "text-white" : "text-gray-800"
                }`}
              >
                Bus {bus.name} ({bus.deviceID})
              </h1>
              <div
                className={`flex items-center justify-center gap-2 ${
                  darktheme ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <MapPin className="w-5 h-5 text-green-600" />
                <p className="text-lg">
                  <span className="font-semibold">{bus.from}</span>
                  <span className="mx-2">→</span>
                  <span className="font-semibold">{bus.to}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN → Driver + Time Slots */}
            <div className="flex flex-col gap-4">
              {/* Driver Details */}
              <div
                className={`rounded-2xl shadow-lg p-4 h-fit ${
                  darktheme
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-green-100"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  <User className="w-5 h-5 text-green-600" />
                  Driver Details
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={bus.driver.picture}
                    alt={bus.driver.name}
                    className="w-16 h-16 rounded-full border-2 border-green-200 shadow-md"
                  />
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-lg ${
                        darktheme ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {bus.driver.name}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-sm mt-1 ${
                        darktheme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <p>{bus.driver.email}</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`space-y-3 rounded-xl p-4 ${
                    darktheme ? "bg-gray-900/50" : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <span className="font-medium">License ID:</span>
                    <span>{bus.driver.licenceId}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Experience:</span>
                    <span>{bus.driver.driverExp} years</span>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div
                className={`rounded-2xl shadow-lg p-6 ${
                  darktheme
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-green-100"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  <Clock className="w-5 h-5 text-green-600" />
                  Time Slots
                </h3>
                <ul className="space-y-3">
                  {bus.timeSlots.map((slot) => (
                    <li
                      key={slot._id}
                      className={`p-4 rounded-xl text-center font-medium shadow-sm transition-all duration-300 ${
                        activeSlot && activeSlot._id === slot._id
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105"
                          : darktheme
                          ? "bg-gray-900/50 text-gray-300 border border-gray-700"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN → Map + Stats */}
            <div
              className={`col-span-1 lg:col-span-2 rounded-2xl shadow-lg p-4 ${
                darktheme
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-green-100"
              }`}
            >
              <h3
                className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                  darktheme ? "text-white" : "text-gray-800"
                }`}
              >
                <MapPin className="w-5 h-5 text-green-600" />
                Live Location
              </h3>

              <MapContainer
                center={bus.liveLocation.coordinates}
                zoom={14}
                style={{ height: "400px", width: "100%", borderRadius: "12px" }}
              >
                <TileLayer
                  url={
                    darktheme
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />
                <Routing path={bus.path} />
                <Marker position={bus.liveLocation.coordinates} icon={busIcon}>
                  <Popup>
                    <b>Bus Live Location</b>
                    <br />
                    {bus.name}
                  </Popup>
                </Marker>
              </MapContainer>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                <div
                  className={`rounded-xl p-3 text-center ${
                    darktheme
                      ? "bg-green-900/30 border border-green-800"
                      : "bg-green-50 border border-green-100"
                  }`}
                >
                  <Gauge className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p
                    className={`text-xs mb-1 ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Speed
                  </p>
                  <p
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {bus.speed} km/h
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 text-center ${
                    darktheme
                      ? "bg-gray-900/50 border border-gray-700"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <RouteIcon
                    className={`w-5 h-5 mx-auto mb-1 ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                  <p
                    className={`text-xs mb-1 ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total
                  </p>
                  <p
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {bus.totalDistance} km
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 text-center ${
                    darktheme
                      ? "bg-blue-900/30 border border-blue-800"
                      : "bg-blue-50 border border-blue-100"
                  }`}
                >
                  <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p
                    className={`text-xs mb-1 ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Covered
                  </p>
                  <p
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {bus.coveredDistance} km
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 text-center ${
                    darktheme
                      ? "bg-orange-900/30 border border-orange-800"
                      : "bg-orange-50 border border-orange-100"
                  }`}
                >
                  <RouteIcon className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p
                    className={`text-xs mb-1 ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Remaining
                  </p>
                  <p
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {bus.remainingDistance} km
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 text-center ${
                    darktheme
                      ? "bg-purple-900/30 border border-purple-800"
                      : "bg-purple-50 border border-purple-100"
                  }`}
                >
                  <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p
                    className={`text-xs mb-1 ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ETA
                  </p>
                  <p
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {bus.ETA}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default BusDetailsPage2;
