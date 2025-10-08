import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// ✅ FIX for missing marker icons on Vercel
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import Navbar from "../shared/Navbar";
import MicInput from "./MicInput";
import { useSelector } from "react-redux";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const POI_TYPES = [
  { label: "Hospital", tag: "hospital", icon: "🏥" },
  { label: "Clinic", tag: "clinic", icon: "🩺" },
  { label: "Pharmacy", tag: "pharmacy", icon: "💊" },
  { label: "Park", tag: "park", icon: "🌳" },
  { label: "Petrol Pump", tag: "fuel", icon: "⛽" },
  { label: "ATM", tag: "atm", icon: "🏧" },
  { label: "Bank", tag: "bank", icon: "🏦" },
  { label: "School", tag: "school", icon: "🏫" },
  { label: "College", tag: "college", icon: "🎓" },
  { label: "Restaurant", tag: "restaurant", icon: "🍽️" },
  { label: "Supermarket", tag: "supermarket", icon: "🛒" },
  { label: "Bus Stop", tag: "bus_station", icon: "🚌" },
  { label: "Police Station", tag: "police", icon: "🚓" },
  { label: "Fire Station", tag: "fire_station", icon: "🚒" },
  { label: "Library", tag: "library", icon: "📚" },
  { label: "Cinema", tag: "cinema", icon: "🎬" },
];

const NearbyPOIMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);
  const routingControlRef = useRef(null);
  const { darktheme } = useSelector((store) => store.auth);

  // 🔎 Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchMarkerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLocation({ lat, lon });

        map.setView([lat, lon], 14);
        L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
      },
      (err) => {
        console.warn("Geolocation error:", err);
      }
    );

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const fetchNearbyPlaces = async (type) => {
    if (!userLocation) return [];

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${type}"](around:20000,${userLocation.lat},${userLocation.lon});
        way["amenity"="${type}"](around:20000,${userLocation.lat},${userLocation.lon});
        relation["amenity"="${type}"](around:20000,${userLocation.lat},${userLocation.lon});
      );
      out center 10;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query.trim(),
      });

      const data = await res.json();
      return data.elements.slice(0, 10);
    } catch (error) {
      console.error("Failed to fetch nearby places:", error);
      return [];
    }
  };

  const handleBadgeClick = async (type) => {
    setSelectedType(type);

    const places = await fetchNearbyPlaces(type);

    if (markersLayer) {
      markersLayer.clearLayers();
      mapInstanceRef.current.removeLayer(markersLayer);
    }

    const newLayer = L.layerGroup();
    places.forEach((place) => {
      const lat = place.lat || place.center?.lat;
      const lon = place.lon || place.center?.lon;
      const name = place.tags?.name || "Unnamed";

      if (lat && lon) {
        const marker = L.marker([lat, lon]).bindPopup(
          `<strong>${name}</strong><br/>Type: ${type}<br/><button id="go-${lat}-${lon}">Go Here</button>`
        );

        marker.on("popupopen", () => {
          const btn = document.getElementById(`go-${lat}-${lon}`);
          if (btn) {
            btn.onclick = () => handleRoute(lat, lon);
          }
        });

        newLayer.addLayer(marker);
      }
    });

    newLayer.addTo(mapInstanceRef.current);
    setMarkersLayer(newLayer);
  };

  const handleRoute = (destLat, destLon) => {
    if (!userLocation) return;

    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lon),
        L.latLng(destLat, destLon),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
        alternatives: true,
      }),
      showAlternatives: true,
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
      altLineOptions: {
        styles: [{ color: "gray", weight: 3, dashArray: "5,5" }],
      },
      addWaypoints: false,
    }).addTo(mapInstanceRef.current);

    routingControlRef.current = control;
  };

  // 🔎 Handle search input
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // 📍 Handle suggestion click
  const handleSuggestionClick = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    mapInstanceRef.current.setView([lat, lon], 14);

    if (searchMarkerRef.current) {
      mapInstanceRef.current.removeLayer(searchMarkerRef.current);
    }

    const marker = L.marker([lat, lon])
      .addTo(mapInstanceRef.current)
      .bindPopup(
        `<b>${place.display_name}</b><br/><button id="go-${lat}-${lon}">Go Here</button>`
      )
      .openPopup();

    marker.on("popupopen", () => {
      const btn = document.getElementById(`go-${lat}-${lon}`);
      if (btn) {
        btn.onclick = () => handleRoute(lat, lon);
      }
    });

    searchMarkerRef.current = marker;
    setSuggestions([]);
    setSearchQuery(place.display_name);
  };

  return (
    <>
    <Navbar/>
     <div className={`min-h-screen ${
       darktheme 
         ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
         : 'bg-gradient-to-br from-green-50 via-white to-green-100'
     }`}>
      {/* Header */}
      <div className={`border-b shadow-sm ${
        darktheme 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-green-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl sm:text-2xl">🗺️</span>
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${
                darktheme ? 'text-white' : 'text-gray-800'
              }`}>
                Explore Nearby
              </h1>
              <p className={`text-xs sm:text-sm ${
                darktheme ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Discover places around you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout (Desktop) / Stacked (Mobile) */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-88px)]">
        {/* Left Sidebar */}
        <div className="w-full lg:w-2/5 p-4 sm:p-6 overflow-y-auto">
          {/* POI Categories - Top */}
          <div className="mb-4 sm:mb-6">
            <div className={`rounded-2xl p-4 sm:p-6 shadow-lg border ${
              darktheme 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-green-100'
            }`}>
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span className="text-lg sm:text-xl">📌</span>
                <h2 className={`text-lg sm:text-xl font-bold ${
                  darktheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Nearby Places
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {POI_TYPES.map((type) => (
                  <button
                    key={type.tag}
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedType === type.tag
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-lg"
                        : darktheme 
                          ? "bg-gray-700 text-gray-200 border-gray-600 hover:border-green-500 hover:shadow-md" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:shadow-md"
                    }`}
                    onClick={() => handleBadgeClick(type.tag)}
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-sm sm:text-base">{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Section - Bottom */}
          <div>
            <div className={`rounded-2xl p-4 sm:p-6 shadow-lg border ${
              darktheme 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-green-100'
            }`}>
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span className="text-lg sm:text-xl">🔍</span>
                <h2 className={`text-lg sm:text-xl font-bold ${
                  darktheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Search Location
                </h2>
              </div>

              <div className="relative">
                <MicInput
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for any location..."
                  className={`w-full border-2 p-3 sm:p-4 pr-10 sm:pr-12 rounded-xl focus:outline-none focus:border-green-500 text-sm sm:text-base transition-all duration-300 hover:shadow-md ${
                    darktheme 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
                 

                {suggestions.length > 0 && (
                  <ul className={`absolute border-2 rounded-xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50 ${
                    darktheme 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-green-100'
                  }`}>
                    {suggestions.map((place) => (
                      <li
                        key={place.place_id}
                        onClick={() => handleSuggestionClick(place)}
                        className={`p-3 sm:p-4 cursor-pointer text-xs sm:text-sm border-b last:border-b-0 flex items-start gap-2 sm:gap-3 transition-all duration-200 ${
                          darktheme 
                            ? 'text-gray-200 border-gray-700 hover:bg-gray-700' 
                            : 'text-gray-700 border-gray-100 hover:bg-green-50'
                        }`}
                      >
                        <span className="text-base sm:text-lg mt-0.5">📍</span>
                        <span className="flex-1">{place.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="w-full lg:w-3/5 p-4 sm:p-6">
          <div className={`rounded-2xl p-4 sm:p-6 shadow-xl h-[400px] sm:h-[500px] lg:h-full border ${
            darktheme 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-green-100'
          }`}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl">🌍</span>
              <h2 className={`text-lg sm:text-xl font-bold ${
                darktheme ? 'text-white' : 'text-gray-800'
              }`}>
                Interactive Map
              </h2>
            </div>

            <div
              ref={mapContainerRef}
              id="map"
              className={`h-[calc(100%-40px)] sm:h-[calc(100%-48px)] w-full rounded-xl border-2 shadow-md overflow-hidden ${
                darktheme ? 'border-gray-600' : 'border-gray-200'
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
    </>
   
  );
};

export default NearbyPOIMap;