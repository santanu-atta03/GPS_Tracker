import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import Navbar from "../shared/Navbar";

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
  { label: "Cafe", tag: "cafe", icon: "☕" },
  { label: "Supermarket", tag: "supermarket", icon: "🛒" },
  { label: "Bus Stop", tag: "bus_station", icon: "🚌" },
  { label: "Police Station", tag: "police", icon: "🚓" },
  { label: "Fire Station", tag: "fire_station", icon: "🚒" },
  { label: "Post Office", tag: "post_office", icon: "📮" },
  { label: "Airport", tag: "airport", icon: "✈️" },
  { label: "Library", tag: "library", icon: "📚" },
  { label: "Cinema", tag: "cinema", icon: "🎬" },
  { label: "Hotel", tag: "hotel", icon: "🏨" },
];

const NearbyPOIMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);
  const routingControlRef = useRef(null);

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

    // Add "Go Here" routing
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
      <Navbar />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">Nearby Places + Search</h2>

        {/* 🔎 Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a location..."
            className="w-full border p-2 rounded-lg"
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-lg shadow-md w-full mt-1 max-h-40 overflow-y-auto z-50">
              {suggestions.map((place) => (
                <li
                  key={place.place_id}
                  onClick={() => handleSuggestionClick(place)}
                  className="p-2 hover:bg-gray-200 cursor-pointer text-sm"
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          ref={mapContainerRef}
          id="map"
          className="h-[550px] w-full rounded-lg border shadow"
        ></div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">Nearby Places</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {POI_TYPES.map((type) => (
            <button
              key={type.tag}
              className={`px-4 py-2 rounded-full border text-sm font-medium ${
                selectedType === type.tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => handleBadgeClick(type.tag)}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        <div
          ref={mapContainerRef}
          id="map"
          className="h-[550px] w-full rounded-lg border shadow"
        ></div>
      </div>
    </>
  );
};

export default NearbyPOIMap;
