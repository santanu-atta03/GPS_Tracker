import React, { useState } from "react";
import MicInput from "./MicInput";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import L from "leaflet";

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
  const { darktheme } = useSelector((store) => store.auth);

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
      <label
        className={`block mb-1 font-medium ${
          darktheme ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>

      <MicInput
        type="text"
        value={query}
        placeholder="Type a place..."
        onChange={(e) => handleSearch(e.target.value)}
        className={`border p-2 w-full rounded ${
          darktheme
            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      />

      {enableUseMyLocation && (
        <button
          type="button"
          className={`text-sm mt-1 underline ${
            darktheme ? "text-blue-400" : "text-blue-600"
          }`}
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? "Getting location..." : "Use My Location"}
        </button>
      )}

      {loading && (
        <p
          className={`text-sm mt-1 ${
            darktheme ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Searching...
        </p>
      )}

      {suggestions.length > 0 && (
        <ul
          className={`absolute z-10 w-full shadow rounded mt-1 max-h-40 overflow-y-auto ${
            darktheme
              ? "bg-gray-800 border border-gray-600"
              : "bg-white border border-gray-200"
          }`}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className={`p-2 cursor-pointer text-sm ${
                darktheme
                  ? "text-gray-200 hover:bg-gray-700"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
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

const RazorpayPayment = () => {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [busId, setBusId] = useState("BUS-111");
  const [ticketData, setTicketData] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const { deviceid } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);

  const handleCalculatePrice = async () => {
    if (!from || !to) {
      alert("Please select both From and To locations.");
      return;
    }

    try {
      setLoadingPrice(true);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/Bus/calculate/price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busId: deviceid,
            fromLat: from.lat,
            fromLng: from.lon,
            toLat: to.lat,
            toLng: to.lon,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setTicketData(data.data);
      } else {
        alert("Failed to calculate ticket price");
      }
    } catch (err) {
      console.error(err);
      alert("Error calculating ticket price");
    } finally {
      setLoadingPrice(false);
    }
  };

  return (
    <>
      <div
        className={`min-h-screen py-8 ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
      >
        <Navbar />
        <div
          className={`max-w-md mx-auto p-6 rounded-lg shadow-lg ${
            darktheme
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              darktheme ? "text-white" : "text-gray-800"
            }`}
          >
            Book Your Bus Ticket
          </h2>

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

          <button
            className={`w-full px-6 py-2 rounded-lg shadow-md mb-4 transition-colors ${
              darktheme
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            onClick={handleCalculatePrice}
            disabled={loadingPrice}
          >
            {loadingPrice ? "Calculating..." : "Get Ticket Price"}
          </button>

          {ticketData && (
            <div
              className={`p-4 rounded ${
                darktheme
                  ? "bg-gray-700 border border-gray-600"
                  : "bg-gray-100 border border-gray-200"
              }`}
            >
              <p className={darktheme ? "text-gray-200" : "text-gray-800"}>
                <strong>From Index:</strong> {ticketData.fromIndex}
              </p>
              <p className={darktheme ? "text-gray-200" : "text-gray-800"}>
                <strong>To Index:</strong> {ticketData.toIndex}
              </p>
              <p className={darktheme ? "text-gray-200" : "text-gray-800"}>
                <strong>Total Distance:</strong> {ticketData.totalDistance} km
              </p>
              <p className={darktheme ? "text-gray-200" : "text-gray-800"}>
                <strong>Passenger Distance:</strong>{" "}
                {ticketData.passengerDistance} km
              </p>
              <p className={darktheme ? "text-gray-200" : "text-gray-800"}>
                <strong>Ticket Price:</strong> ₹{ticketData.ticketPrice}
              </p>
              <p className={darktheme ? "text-gray-200" : "text-gray-800"}>
                <strong>Price per km:</strong> ₹{ticketData.pricePerKm}
              </p>

              <button
                className={`w-full px-6 py-2 rounded-lg shadow-md mt-4 transition-colors ${
                  darktheme
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                onClick={async () => {
                  // Razorpay payment
                  const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/Bus/create-order`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount: ticketData.ticketPrice }),
                    }
                  );
                  const order = await res.json();

                  const options = {
                    key: "rzp_test_RPcZFwp7G16Gjf",
                    amount: order.amount,
                    currency: order.currency,
                    name: "Bus Ticket Booking",
                    description: `Ticket for Bus ${busId}`,
                    order_id: order.id,
                    handler: async function (response) {
                      const token = await getAccessTokenSilently({
                        audience: "http://localhost:5000/api/v3",
                      });
                      const verifyRes = await axios.post(
                        `${import.meta.env.VITE_BASE_URL}/Bus/verify-payment`,

                        {
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                          ticketData,
                          busId: deviceid,
                          fromLat: from.lat,
                          fromLng: from.lon,
                          toLat: to.lat,
                          toLng: to.lon,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );

                      const verifyData = await verifyRes.json();
                      alert(verifyData.message);
                      console.log("✅ Verify Response:", verifyData);
                    },

                    prefill: {
                      name: "Ayan Manna",
                      email: "mannaayan777@gmail.com",
                      contact: "9907072795",
                    },
                    theme: { color: "#3399cc" },
                  };

                  const rzp1 = new window.Razorpay(options);
                  rzp1.open();
                }}
              >
                Pay ₹{ticketData.ticketPrice}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RazorpayPayment;
