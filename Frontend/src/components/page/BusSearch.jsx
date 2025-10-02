import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Bus, Search } from "lucide-react";
import axios from "axios";
import MicInput from "./MicInput";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/v1/Myroute";
const GEOCODE_API = "https://nominatim.openstreetmap.org/search";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
    <div className="mb-4 relative">
      <label className="block mb-1 font-medium">{label}</label>

      <MicInput
        type="text"
        value={query}
        placeholder="Type a place..."
        onChange={(e) => handleSearch(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {enableUseMyLocation && (
        <button
          type="button"
          className="text-blue-600 text-sm mt-1 underline"
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? "Getting location..." : "Use My Location"}
        </button>
      )}

      {loading && <p className="text-sm text-gray-400 mt-1">Searching...</p>}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white shadow rounded mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
              onClick={() => {
                const pos = { lat: parseFloat(s.lat), lon: parseFloat(s.lon) };
                setQuery(s.display_name);
                setSelectedPos(pos);
                onSelect({ ...pos, address: s.display_name });
                setSuggestions([]);
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      {selectedPos && (
        <div className="mt-4 h-64">
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
  const [results, setResults] = useState(null); // ✅ can be object (multi-hop) or array
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        res = await axios.post(`${API_BASE}/find-bus`, {
          fromLat: from.lat,
          fromLng: from.lon,
          toLat: to.lat,
          toLng: to.lon,
        });
        console.log(res);
      } else if (searchType === "device") {
        if (!deviceId) return alert("Please enter Device ID");
        res = await axios.post(`${API_BASE}/find-bus-By-id`, {
          DeviceId: deviceId,
        });
      } else if (searchType === "name") {
        if (!busName) return alert("Please enter Bus Name");
        res = await axios.post(`${API_BASE}/find-bus-bu-name`, {
          BusName: busName,
        });
      }

      const data = res.data;
      if (data.success) {
        if (searchType === "route") setResults(data); // may include multi-hop
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Search Type Selector */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={searchType === "route" ? "default" : "outline"}
          onClick={() => setSearchType("route")}
        >
          By Route
        </Button>
        <Button
          variant={searchType === "device" ? "default" : "outline"}
          onClick={() => setSearchType("device")}
        >
          By Device ID
        </Button>
        <Button
          variant={searchType === "name" ? "default" : "outline"}
          onClick={() => setSearchType("name")}
        >
          By Bus Name
        </Button>
      </div>

      {/* Route Search */}
      {searchType === "route" && (
        <div className="mb-6">
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
        <div className="mb-6">
          <MicInput
            placeholder="Enter Device ID (e.g. BUS-1234)"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
        </div>
      )}

      {/* Name Search */}
      {searchType === "name" && (
        <div className="mb-6">
          <Input
            placeholder="Enter Bus Name (e.g. 44)"
            value={busName}
            onChange={(e) => setBusName(e.target.value)}
          />
        </div>
      )}

      {/* Search Button */}
      <Button
        className="w-full flex items-center justify-center gap-2"
        onClick={handleSearch}
        disabled={loading}
      >
        <Search className="w-5 h-5" />
        {loading ? "Searching..." : "Search"}
      </Button>

      {/* Results */}
      <div className="mt-8">
        {/* ✅ Multi-hop case */}
        {searchType === "route" && results ? (
          <>
            {results.type === "direct" && (
              <div className="grid gap-4">
                {results.buses.map((bus, idx) => (
                  <Card
                    key={bus._id}
                    className="shadow-lg rounded-2xl"
                    onClick={() => navigate(`bus/${bus.deviceID}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Bus className="w-10 h-10 text-green-600" />
                      <div>
                        <h2 className="text-lg font-semibold">
                          Bus Name: {bus.name || "N/A"}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Device ID: {bus.deviceID}
                        </p>
                        <p className="text-sm text-gray-600">
                          Route: {bus.from} → {bus.to}
                        </p>
                      </div>
                      <MapPin className="w-6 h-6 text-blue-500 ml-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {results.type === "multi-hop" && (
              <div className="space-y-6">
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

                      <Card className="flex-1 shadow-lg border-l-4 border-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Bus className="w-8 h-8 text-green-600" />
                            <div>
                              <h3 className="font-semibold text-lg">
                                Bus: {bus.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Route: {bus.from} → {bus.to}
                              </p>
                              <p className="text-sm text-gray-500">
                                Device: {bus.deviceID}
                              </p>
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
          /* ✅ Normal single-bus case */
          <div className="grid gap-4">
            {results.map((bus, idx) => (
              <Card
                key={idx}
                className="shadow-lg rounded-2xl"
                onClick={() => navigate(`bus/${bus.deviceID}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Bus className="w-10 h-10 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      Bus Name: {bus.name || "N/A"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Device ID: {bus.deviceID}
                    </p>
                    <p className="text-sm text-gray-600">
                      Route: {bus.from} → {bus.to}
                    </p>
                    {bus.driver && (
                      <p className="text-sm text-gray-500">
                        Driver ID: {bus.driver}
                      </p>
                    )}
                  </div>
                  <MapPin className="w-6 h-6 text-blue-500 ml-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-center text-gray-500">No buses found</p>
          )
        )}
      </div>
    </div>
  );
};

export default BusSearch;
