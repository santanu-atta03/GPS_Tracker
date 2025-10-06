import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Bus, Search, Navigation } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDispatch } from "react-redux";
import { setpath } from "@/Redux/auth.reducer";
import MicInput from "./MicInput";

const API_BASE = `${import.meta.env.VITE_BASE_URL}/Myroute`;
const GEOCODE_API = "https://nominatim.openstreetmap.org/search";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
};

const PlaceSearch = ({ label, onSelect, enableUseMyLocation = false }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);

  const handleSearch = async (value) => {
    setQuery(value);
    if (value.length < 3) return setSuggestions([]);

    try {
      setLoading(true);
      const res = await fetch(
        `${GEOCODE_API}?q=${encodeURIComponent(value)}&format=json&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Geocode error:", err);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `${GEOCODE_API}?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`
      );
      const data = await res.json();
      return data[0]?.display_name || `${lat}, ${lon}`;
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      return `${lat}, ${lon}`;
    }
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          setQuery(address);
          setSelectedPos({ lat: latitude, lon: longitude });
          onSelect({ lat: latitude, lon: longitude, address });
          setSuggestions([]);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error", err);
        alert("Unable to get location.");
        setLoadingLocation(false);
      }
    );
  };

  return (
    <div className="mb-6 relative">
      <label className="block mb-2 font-medium text-gray-700 text-sm">
        {label}
      </label>

      <MicInput
        type="text"
        value={query}
        placeholder="Type a place..."
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
      />

      {enableUseMyLocation && (
        <button
          type="button"
          className="text-green-600 text-sm mt-2 hover:text-green-700 underline font-medium transition-colors"
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? "Getting location..." : "Use My Location"}
        </button>
      )}

      {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
      
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white shadow-xl rounded-xl mt-2 max-h-60 overflow-y-auto border border-gray-200">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="p-3 cursor-pointer hover:bg-green-50 text-sm transition-colors border-b last:border-b-0"
              onClick={() => {
                const pos = { lat: parseFloat(s.lat), lon: parseFloat(s.lon) };
                setQuery(s.display_name);
                setSelectedPos(pos);
                onSelect({ ...pos, address: s.display_name });
                setSuggestions([]);
              }}
            >
              <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      {selectedPos && (
        <div className="mt-4 h-64 rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <MapContainer
            center={[selectedPos.lat, selectedPos.lon]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker
              position={[selectedPos.lat, selectedPos.lon]}
              icon={markerIcon}
            />
            <LocationPicker
              onSelect={async (pos) => {
                setSelectedPos(pos);
                const address = await reverseGeocode(pos.lat, pos.lon);
                setQuery(address);
                onSelect({ ...pos, address });
              }}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

const BusSearch = () => {
  const [searchType, setSearchType] = useState("route");
  const [from, setFrom] = useState({ lat: "", lon: "" });
  const [to, setTo] = useState({ lat: "", lon: "" });
  const [deviceId, setDeviceId] = useState("");
  const [busName, setBusName] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSearch = async () => {
    try {
      setLoading(true);
      let res;

      if (searchType === "route") {
        if (!from.lat || !from.lon || !to.lat || !to.lon) {
          alert("Please select both From and To locations");
          return;
        }
        console.log(from);
        console.log(to);
        res = await axios.post(`${import.meta.env.VITE_BASE_URL}/Myroute/find-bus`, {
          fromLat: from.lat,
          fromLng: from.lon,
          toLat: to.lat,
          toLng: to.lon,
        });
        console.log(res);
      } else if (searchType === "device") {
        if (!deviceId) return alert("Please enter Device ID");
        res = await axios.post(`${import.meta.env.VITE_BASE_URL}/Myroute/find-bus-By-id`, {
          DeviceId: deviceId,
        });
      } else if (searchType === "name") {
        if (!busName) return alert("Please enter Bus Name");
        res = await axios.post(`${import.meta.env.VITE_BASE_URL}/Myroute/find-bus-bu-name`, {
          BusName: busName,
        });
      }

      const data = res.data;
      dispatch(setpath(data));
      if (data.success) {
        if (searchType === "route") setResults(data);
        else if (searchType === "device") setResults([data.allbus]);
        else setResults(data.allBus || []);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const canSearch = () => {
    if (searchType === "route") return from.lat && from.lon && to.lat && to.lon;
    if (searchType === "device") return deviceId.trim().length > 0;
    if (searchType === "name") return busName.trim().length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Find Your Bus
          </h1>
          <p className="text-lg text-gray-600">
            Search by route, device ID, or bus name
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Search Options
          </h2>

          {/* Search Type Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-2 transition-all duration-200 inline-flex flex-wrap gap-2">
              <button
                onClick={() => setSearchType("route")}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  searchType === "route"
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                By Route
              </button>
              <button
                onClick={() => setSearchType("device")}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  searchType === "device"
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Navigation className="w-4 h-4 inline mr-2" />
                By Device ID
              </button>
              <button
                onClick={() => setSearchType("name")}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  searchType === "name"
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Bus className="w-4 h-4 inline mr-2" />
                By Bus Name
              </button>
            </div>
          </div>

          {/* Route Search */}
          {searchType === "route" && (
            <div>
              <PlaceSearch
                label="From"
                enableUseMyLocation={true}
                onSelect={(place) => setFrom({ lat: place.lat, lon: place.lon })}
              />
              <PlaceSearch
                label="To"
                onSelect={(place) => setTo({ lat: place.lat, lon: place.lon })}
              />
            </div>
          )}

          {/* Device Search */}
          {searchType === "device" && (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Device ID
              </label>
              <input
                placeholder="Enter Device ID (e.g. BUS-1234)"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Name Search */}
          {searchType === "name" && (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Bus Name
              </label>
              <input
                placeholder="Enter Bus Name (e.g. 44)"
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Search Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleSearch}
              disabled={!canSearch() || loading}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg transform flex items-center mx-auto ${
                canSearch() && !loading
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? "Searching..." : "Search Buses"}
            </button>

            {searchType === "route" && results && (
              <button
                className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/fllow/path")}
              >
                Start Journey
              </button>
            )}
          </div>

          {/* Search Tips */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {searchType === "route" && "Select both starting point and destination"}
              {searchType === "device" && "Enter the exact device ID of the bus"}
              {searchType === "name" && "Enter the bus route name or number"}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {searchType === "route" && results ? (
            <>
              {results.type === "direct" && (
                <div className="space-y-6 bg-white rounded-2xl shadow-xl p-8 border border-green-100">
                  <div className="flex flex-col items-center">
                    <h2 className="text-lg font-bold text-green-700">Start</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {results.pathAddresses?.[0]?.address || "Unknown start location"}
                    </p>
                  </div>

                  {results.busesUsed.map((bus, idx) => (
                    <Card
                      key={bus._id}
                      className="shadow-lg border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => navigate(`bus/${bus.deviceID}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Bus className="w-8 h-8 text-green-600" />
                          <div>
                            <h3 className="font-semibold text-lg">{bus.name || "N/A"}</h3>
                            <p className="text-sm text-gray-600">
                              Route: {bus.from || "N/A"} → {bus.to || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">Device: {bus.deviceID}</p>
                            {bus.nextStartTime && (
                              <p className="text-sm text-gray-500">
                                Time: {bus.nextStartTime.startTime} to {bus.nextStartTime.endTime}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex flex-col items-center">
                    <h2 className="text-lg font-bold text-red-700">Destination</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {results.pathAddresses?.[results.pathAddresses.length - 1]?.address || "Unknown destination"}
                    </p>
                  </div>
                </div>
              )}

              {results.type === "multi-hop" && (
                <div className="space-y-6 bg-white rounded-2xl shadow-xl p-8 border border-green-100">
                  <div className="flex flex-col items-center">
                    <h2 className="text-lg font-bold text-green-700">Start</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {results.pathAddresses?.[0].address}
                    </p>
                  </div>

                  {results.busesUsed.map((bus, idx) => {
                    const isLast = idx === results.busesUsed.length - 1;
                    const changeLocation = results.pathAddresses?.[idx + 2];

                    return (
                      <div
                        key={bus._id}
                        className="flex items-start gap-6"
                        onClick={() => navigate(`bus/${bus.deviceID}`)}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-1 bg-gray-400 h-12"></div>
                          <div className="text-gray-700 text-sm font-medium text-center">
                            {isLast ? "Destination" : "Change Here"}
                            {changeLocation?.address && (
                              <p className="text-xs text-gray-500 mt-1">
                                {changeLocation.address}
                              </p>
                            )}
                          </div>
                          <div className="w-1 bg-gray-400 h-12"></div>
                        </div>

                        <Card className="flex-1 shadow-lg border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Bus className="w-8 h-8 text-green-600" />
                              <div>
                                <h3 className="font-semibold text-lg">Bus: {bus.name}</h3>
                                <p className="text-sm text-gray-600">
                                  Route: {bus.from} → {bus.to}
                                </p>
                                <p className="text-sm text-gray-500">Device: {bus.deviceID}</p>
                                <p className="text-sm text-gray-500">
                                  Time: {bus.nextStartTime.startTime} to {bus.nextStartTime.endTime}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : Array.isArray(results) && results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((bus, idx) => (
                <Card
                  key={idx}
                  className="shadow-lg rounded-2xl cursor-pointer hover:shadow-xl transition-shadow duration-300 border border-green-100"
                  onClick={() => navigate(`bus/${bus.deviceID}`)}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Bus className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Bus Name: {bus.name || "N/A"}
                      </h2>
                      <p className="text-sm text-gray-600">Device ID: {bus.deviceID}</p>
                      <p className="text-sm text-gray-600">
                        Route: {bus.from} → {bus.to}
                      </p>
                      {bus.driver && (
                        <p className="text-sm text-gray-500">Driver ID: {bus.driver}</p>
                      )}
                    </div>
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !loading && results === null && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
                <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No buses found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BusSearch;