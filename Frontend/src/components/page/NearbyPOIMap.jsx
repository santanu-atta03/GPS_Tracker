import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const mapInstanceRef = useRef(null); // keep reference to Leaflet map
  const [selectedType, setSelectedType] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);

  useEffect(() => {
    // ✅ Prevent multiple map initializations
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5); // Default center (India)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    // ✅ Get user location and center the map
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

    // ✅ Cleanup on unmount
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

      // Limit results to 10 manually (as a fallback in case Overpass returns more)
      return data.elements.slice(0, 10);
    } catch (error) {
      console.error("Failed to fetch nearby places:", error);
      return [];
    }
  };

  const handleBadgeClick = async (type) => {
    setSelectedType(type);

    const places = await fetchNearbyPlaces(type);

    // Remove previous markers
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
          `<strong>${name}</strong><br/>Type: ${type}`
        );
        newLayer.addLayer(marker);
      }
    });

    newLayer.addTo(mapInstanceRef.current);
    setMarkersLayer(newLayer);
  };

  return (
    <>
    <Navbar/>
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
