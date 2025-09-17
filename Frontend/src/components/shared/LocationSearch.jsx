import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

export default function LocationSearch() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);

  // 🔹 Fetch address suggestions (Forward Geocoding)
  const fetchSuggestions = async (query, setFn) => {
    if (query.length < 2) return setFn([]);
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/search?q=${query}`
    );
    const data = await res.json();
    setFn(data);
  };

  // 🔹 Select from suggestion (address → coords)
  const selectFrom = (place) => {
    setFromLocation(place.display_name);
    setFromCoords({ lat: place.lat, lon: place.lon });
    setFromSuggestions([]);
  };

  // 🔹 Select to suggestion (address → coords)
  const selectTo = (place) => {
    setToLocation(place.display_name);
    setToCoords({ lat: place.lat, lon: place.lon });
    setToSuggestions([]);
  };

  // 🔹 Use My Location (Reverse Geocoding)
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `${import.meta.env.VITE_BASE_URL}/reverse-geocode?lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();

            if (data.display_name) {
              setFromLocation(data.display_name);
              setFromCoords({ lat: latitude, lon: longitude });
            } else {
              alert("Unable to fetch address");
            }
          } catch (err) {
            console.error(err);
            alert("Error fetching location");
          }
        },
        (error) => {
          console.error(error);
          alert("Please enable location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // 🔹 Swap From & To
  const swapLocations = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
    setFromCoords(toCoords);
    setToCoords(fromCoords);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* From */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => {
                setFromLocation(e.target.value);
                fetchSuggestions(e.target.value, setFromSuggestions);
              }}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Select starting point"
            />
            <button
              onClick={handleUseMyLocation}
              className="px-3 py-2 bg-green-100 hover:bg-green-200 rounded-xl text-green-700 text-sm"
              title="Use My Location"
            >
              📍
            </button>
          </div>
          {/* Suggestions */}
          {fromSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {fromSuggestions.map((place, idx) => (
                <li
                  key={idx}
                  onClick={() => selectFrom(place)}
                  className="p-2 cursor-pointer hover:bg-green-100"
                >
                  {place.display_name}
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
            onChange={(e) => {
              setToLocation(e.target.value);
              fetchSuggestions(e.target.value, setToSuggestions);
            }}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Select destination"
          />
          {/* Suggestions */}
          {toSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {toSuggestions.map((place, idx) => (
                <li
                  key={idx}
                  onClick={() => selectTo(place)}
                  className="p-2 cursor-pointer hover:bg-green-100"
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          From:{" "}
          {fromCoords
            ? `${fromLocation} → (${fromCoords.lat}, ${fromCoords.lon})`
            : "Not selected"}
        </p>
        <p>
          To:{" "}
          {toCoords
            ? `${toLocation} → (${toCoords.lat}, ${toCoords.lon})`
            : "Not selected"}
        </p>
      </div>
    </div>
  );
}
