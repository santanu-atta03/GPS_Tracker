import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";

const CreateBus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [deviceID, setDeviceID] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [name, setName] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ startTime: "", endTime: "" }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  // Separate states for "From" search
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);

  // Separate states for "To" search
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const navigate = useNavigate();

  const handleTimeSlotChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: "", endTime: "" }]);
  };

  const removeTimeSlot = (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/Bus/createbus`,
        { name, deviceID, from, to, timeSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Bus created successfully!");
      setDeviceID("");
      setFrom("");
      setTo("");
      setName("");
      setFromSearchQuery("");
      setToSearchQuery("");
      setTimeSlots([{ startTime: "", endTime: "" }]);
      navigate("/Bus");
    } catch (error) {
      console.error("Error creating bus:", error);
      setSuccess("Failed to create bus.");
    } finally {
      setLoading(false);
    }
  };

  // Handle "From" search
  const handleFromSearchChange = async (e) => {
    const value = e.target.value;
    setFromSearchQuery(value);

    if (value.length < 3) {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setFromSuggestions(data);
      setShowFromSuggestions(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Handle "To" search
  const handleToSearchChange = async (e) => {
    const value = e.target.value;
    setToSearchQuery(value);

    if (value.length < 3) {
      setToSuggestions([]);
      setShowToSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setToSuggestions(data);
      setShowToSuggestions(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Handle "From" suggestion click
  const handleFromSuggestionClick = (place) => {
    setFrom(place.display_name);
    setFromSearchQuery(place.display_name);
    setFromSuggestions([]);
    setShowFromSuggestions(false);
  };

  // Handle "To" suggestion click
  const handleToSuggestionClick = (place) => {
    setTo(place.display_name);
    setToSearchQuery(place.display_name);
    setToSuggestions([]);
    setShowToSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto mt-6 shadow-xl rounded-2xl border border-green-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 text-center">
              Create New Bus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Bus Name */}
              <div>
                <Label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bus Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Bus name"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Device ID */}
              <div>
                <Label
                  htmlFor="deviceID"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Device ID
                </Label>
                <Input
                  id="deviceID"
                  value={deviceID}
                  onChange={(e) => setDeviceID(e.target.value)}
                  placeholder="Enter device ID"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* From Location */}
              <div>
                <div className="rounded-2xl p-6 shadow-lg bg-white border border-gray-200">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-xl">🔍</span>
                    <h2 className="text-xl font-bold text-gray-800">From</h2>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={fromSearchQuery}
                      onChange={handleFromSearchChange}
                      placeholder="Search for starting location..."
                      className="w-full border-2 border-gray-200 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-400 bg-white"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <ul className="absolute bg-white border-2 border-gray-200 rounded-xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50">
                        {fromSuggestions.map((place, index) => (
                          <li
                            key={place.place_id}
                            onClick={() => handleFromSuggestionClick(place)}
                            className="p-4 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-lg mt-0.5">📍</span>
                            <span className="flex-1">{place.display_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* To Location */}
              <div>
                <div className="rounded-2xl p-6 shadow-lg bg-white border border-gray-200">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-xl">🔍</span>
                    <h2 className="text-xl font-bold text-gray-800">To</h2>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={toSearchQuery}
                      onChange={handleToSearchChange}
                      placeholder="Search for destination..."
                      className="w-full border-2 border-gray-200 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-400 bg-white"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {showToSuggestions && toSuggestions.length > 0 && (
                      <ul className="absolute bg-white border-2 border-gray-200 rounded-xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50">
                        {toSuggestions.map((place, index) => (
                          <li
                            key={place.place_id}
                            onClick={() => handleToSuggestionClick(place)}
                            className="p-4 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-lg mt-0.5">📍</span>
                            <span className="flex-1">{place.display_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slots
                </Label>
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        handleTimeSlotChange(index, "startTime", e.target.value)
                      }
                      required
                      className="flex-1 p-3 border border-gray-300 rounded-xl"
                    />
                    <span className="mx-1">to</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        handleTimeSlotChange(index, "endTime", e.target.value)
                      }
                      required
                      className="flex-1 p-3 border border-gray-300 rounded-xl"
                    />
                    {timeSlots.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addTimeSlot}
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  Add Time Slot
                </Button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? "Creating..." : "Create Bus"}
              </Button>
            </form>

            {success && (
              <p className="mt-4 text-center text-green-700 font-medium">
                {success}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Bus Sewa. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default CreateBus;