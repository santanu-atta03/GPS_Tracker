// components/search/LocationSearch.jsx
import { useState, useEffect } from "react";
import { ArrowLeftRight, MapPin, Loader2 } from "lucide-react";

export default function LocationSearch({ onCoordsSelect, onLocationChange }) {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch address suggestions with debouncing
  const fetchSuggestions = async (query, setFn, type) => {
    if (query.length < 2) {
      setFn([]);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      setFn(data.slice(0, 5)); // Limit to 5 suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setFn([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced fetch suggestions
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  // Select from suggestion
  const selectFrom = (place) => {
    const coords = { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
    setFromLocation(place.display_name);
    setFromCoords(coords);
    setFromSuggestions([]);
    
    // Notify parent component
    if (onLocationChange) {
      onLocationChange('from', {
        address: place.display_name,
        coords: coords,
        place: place
      });
    }
  };

  // Select to suggestion
  const selectTo = (place) => {
    const coords = { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
    setToLocation(place.display_name);
    setToCoords(coords);
    setToSuggestions([]);
    
    // Notify parent component
    if (onLocationChange) {
      onLocationChange('to', {
        address: place.display_name,
        coords: coords,
        place: place
      });
    }
  };

  // Use current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/v1/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          
          if (!res.ok) throw new Error('Failed to fetch location');
          const data = await res.json();

          if (data.display_name) {
            const coords = { lat: latitude, lon: longitude };
            setFromLocation(data.display_name);
            setFromCoords(coords);
            
            if (onLocationChange) {
              onLocationChange('from', {
                address: data.display_name,
                coords: coords,
                place: data
              });
            }
          } else {
            alert("Unable to fetch address for your location");
          }
        } catch (error) {
          console.error('Error fetching location:', error);
          alert("Error fetching your location address");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = "Error getting your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += "Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message += "Location request timed out.";
            break;
          default:
            message += "Please try again.";
            break;
        }
        alert(message);
        setIsLoadingLocation(false);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Swap locations
  const swapLocations = () => {
    // Swap display names
    const tempLocation = fromLocation;
    setFromLocation(toLocation);
    setToLocation(tempLocation);
    
    // Swap coordinates
    const tempCoords = fromCoords;
    setFromCoords(toCoords);
    setToCoords(tempCoords);
    
    // Notify parent component
    if (onLocationChange && fromCoords && toCoords) {
      onLocationChange('from', {
        address: toLocation,
        coords: toCoords
      });
      onLocationChange('to', {
        address: fromLocation,
        coords: fromCoords
      });
    }
  };

  // Notify parent when coordinates change
  useEffect(() => {
    if (onCoordsSelect) {
      onCoordsSelect({ 
        from: fromCoords, 
        to: toCoords,
        fromAddress: fromLocation,
        toAddress: toLocation
      });
    }
  }, [fromCoords, toCoords, fromLocation, toLocation]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* From Location */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => {
                  setFromLocation(e.target.value);
                  debouncedFetchSuggestions(e.target.value, setFromSuggestions, 'from');
                }}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Select starting point"
              />
              {isLoadingSuggestions && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <button
              onClick={handleUseMyLocation}
              disabled={isLoadingLocation}
              className="px-3 py-2 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 rounded-xl text-green-700 text-sm transition-colors"
              title="Use My Location"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {/* From Suggestions */}
          {fromSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {fromSuggestions.map((place, idx) => (
                <li
                  key={idx}
                  onClick={() => selectFrom(place)}
                  className="p-3 cursor-pointer hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {place.display_name.split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {place.display_name}
                      </p>
                    </div>
                  </div>
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

        {/* To Location */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="text"
            value={toLocation}
            onChange={(e) => {
              setToLocation(e.target.value);
              debouncedFetchSuggestions(e.target.value, setToSuggestions, 'to');
            }}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Select destination"
          />
          
          {/* To Suggestions */}
          {toSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {toSuggestions.map((place, idx) => (
                <li
                  key={idx}
                  onClick={() => selectTo(place)}
                  className="p-3 cursor-pointer hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {place.display_name.split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {place.display_name}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Coordinates Display (for debugging) */}
      {(fromCoords || toCoords) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          {fromCoords && (
            <p>From: {fromLocation} → ({fromCoords.lat.toFixed(6)}, {fromCoords.lon.toFixed(6)})</p>
          )}
          {toCoords && (
            <p>To: {toLocation} → ({toCoords.lat.toFixed(6)}, {toCoords.lon.toFixed(6)})</p>
          )}
        </div>
      )}
    </div>
  );
}