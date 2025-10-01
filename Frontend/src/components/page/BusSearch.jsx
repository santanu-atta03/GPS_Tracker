import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Bus, Search } from "lucide-react";
import axios from "axios";
import MicInput from "./MicInput";

const API_BASE = "http://localhost:5000/api/v1/Myroute";
const GEOCODE_API = "https://nominatim.openstreetmap.org/search";

// Place autocomplete component
const PlaceSearch = ({ label, onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="mb-4 relative">
      <label className="block mb-1 font-medium">{label}</label>
      <MicInput
        value={query}
        placeholder="Type a place..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      {loading && <p className="text-sm text-gray-400 mt-1">Searching...</p>}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white shadow rounded mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
              onClick={() => {
                onSelect({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
                setQuery(s.display_name);
                setSuggestions([]);
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      let res;

      if (searchType === "route") {
        if (!from.lat || !from.lon || !to.lat || !to.lon) {
          alert("Please select both From and To locations");
          return;
        }
        res = await axios.post(`${API_BASE}/find-bus`, {
          fromLat: from.lat,
          fromLng: from.lon,
          toLat: to.lat,
          toLng: to.lon,
        });
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
        if (searchType === "route") setResults(data.allBus || []);
        else if (searchType === "device") setResults([data.allbus]);
        else setResults(data.allBus || []);
      } else {
        setResults([]);
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
      <div className="mt-8 grid gap-4">
        {results.length > 0
          ? results.map((bus, idx) => (
              <Card key={idx} className="shadow-lg rounded-2xl">
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
            ))
          : !loading && (
              <p className="text-center text-gray-500">No buses found</p>
            )}
      </div>
    </div>
  );
};

export default BusSearch;
