import { useState } from "react";
import { ArrowLeftRight, MapPin } from "lucide-react";

export default function LocationSearch() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  // ✅ Fetch suggestions from OSM
  const fetchSuggestions = async (query, setFn) => {
    if (query.length < 2) return setFn([]);
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/search?q=${query}`);
    const data = await res.json();
    setFn(data.map((place) => place.display_name));
  };

  // ✅ Reverse Geocode from lat/lon → Address
  const fetchAddressFromCoords = async (lat, lon) => {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/reverse-geocode?lat=${lat}&lon=${lon}`
    );
    return res.json();
  };

  // ✅ Handlers
  const handleFromChange = (val) => {
    setFromLocation(val);
    fetchSuggestions(val, setFromSuggestions);
  };

  const handleToChange = (val) => {
    setToLocation(val);
    fetchSuggestions(val, setToSuggestions);
  };

  const selectFrom = (val) => {
    setFromLocation(val);
    setFromSuggestions([]);
  };

  const selectTo = (val) => {
    setToLocation(val);
    setToSuggestions([]);
  };

  const swapLocations = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  // ✅ Use My Location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const data = await fetchAddressFromCoords(latitude, longitude);
            if (data.display_name) {
              setFromLocation(data.display_name);
              setFromSuggestions([]);
            }
          } catch (err) {
            console.error(err);
            alert("Error getting location");
          }
        },
        (err) => {
          console.error(err);
          alert("Please enable location access.");
        }
      );
    } else {
      alert("Geolocation not supported in this browser.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* From */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <input
            type="text"
            value={fromLocation}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Select starting point"
          />
          {/* Suggestions dropdown */}
          {(fromSuggestions.length > 0 || true) && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {/* 📍 Use My Location option */}
              <li
                onClick={handleUseMyLocation}
                className="p-2 cursor-pointer flex items-center gap-2 hover:bg-green-100 text-green-600 font-medium"
              >
                <MapPin className="w-4 h-4" /> Use My Location
              </li>
              {fromSuggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => selectFrom(s)}
                  className="p-2 cursor-pointer hover:bg-green-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={swapLocations}
          className="mt-8 p-3 bg-green-100 hover:bg-green-200 rounded-full transition-all duration-300 hover:scale-110"
          title="Swap locations"
        >
          <ArrowLeftRight className="w-5 h-5 text-green-600" />
        </button>

        {/* To */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="text"
            value={toLocation}
            onChange={(e) => handleToChange(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Select destination"
          />
          {/* Suggestions dropdown */}
          {toSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {toSuggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => selectTo(s)}
                  className="p-2 cursor-pointer hover:bg-green-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
