import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import {
  Bus as BusIcon,
  Plus,
  MapPin,
  Navigation,
  User,
  Mail,
  CreditCard,
  AlertTriangle,
  Loader2,
  Route,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Bus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 ADDED: State to track active buses and intervals
  const [activeBuses, setActiveBuses] = useState({});
  const locationIntervals = useRef({});

  // ✅ Fetch all buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/driver/allBus`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast(res.data.message);
        setBuses(res.data.AllBus || []);
      } catch (error) {
        console.error("Error fetching buses:", error);
        setError("Failed to fetch buses. Please try again later.");
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [getAccessTokenSilently]);

  // ✅ MODIFIED: Removed incorrect "fatch" useEffect

  const handleCreateBus = () => {
    navigate("/createbus");
  };

  const handleBusClick = (bus) => {
    navigate(`/bus/${bus.deviceID}`);
  };

  // 🔥 ADDED: Toggle location sending
  const toggleBusActive = (busId) => {
    const isActive = !!activeBuses[busId];

    if (isActive) {
      // Turn off
      clearInterval(locationIntervals.current[busId]);
      delete locationIntervals.current[busId];
      setActiveBuses((prev) => {
        const updated = { ...prev };
        delete updated[busId];
        return updated;
      });
    } else {
      // Turn on
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            const sendLocation = async () => {
              try {
                await axios.put("http://localhost:5000/api/v1/update/location", {
                  deviceID: busId,
                  latitude,
                  longitude,
                });
                console.log(`Location sent for ${busId}:`, latitude, longitude);
              } catch (error) {
                console.error(`Failed to send location for ${busId}`, error);
              }
            };

            sendLocation(); // Send immediately
            const intervalId = setInterval(sendLocation, 5000); // Send every 5 sec

            locationIntervals.current[busId] = intervalId;

            setActiveBuses((prev) => ({
              ...prev,
              [busId]: true,
            }));
          },
          (err) => {
            toast.error("Unable to access location. Please allow location access.");
            console.error(err);
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
      }
    }
  };

  // 🔥 ADDED: Clear all intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(locationIntervals.current).forEach(clearInterval);
    };
  }, []);

  return (
    <div
      className={`min-h-screen ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
      }`}
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ... header & stats unchanged ... */}

        {/* Buses Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.length > 0 ? (
              buses.map((bus) => (
                <div
                  key={bus._id}
                  className={`rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    darktheme
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-green-100"
                  }`}
                >
                  {/* ✅ Bus Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex items-center"
                      onClick={() => handleBusClick(bus)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          darktheme ? "bg-green-900/50" : "bg-green-100"
                        }`}
                      >
                        <BusIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3
                        className={`text-lg font-bold ${
                          darktheme ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {bus.deviceID}
                      </h3>
                    </div>

                    {/* 🔥 Switch Toggle */}
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={!!activeBuses[bus.deviceID]}
                            onChange={() => toggleBusActive(bus.deviceID)}
                          />
                          <div
                            className={`w-10 h-5 bg-gray-300 rounded-full shadow-inner transition ${
                              activeBuses[bus.deviceID]
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div
                            className={`dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${
                              activeBuses[bus.deviceID]
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ... existing content (route, driver info) unchanged ... */}

                  {/* Route Info */}
                  <div className="space-y-3 mb-4">
                    <div
                      className={`flex items-center ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">From:</span>
                        <p className="text-sm truncate">{bus.from}</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <Navigation className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">To:</span>
                        <p className="text-sm truncate">{bus.to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {bus.driver ? (
                    <div
                      className={`border-t pt-4 mt-4 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl ${
                        darktheme
                          ? "bg-gray-900/50 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-3 flex items-center ${
                          darktheme ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Driver Details
                      </h4>
                      <div className="space-y-2">
                        <div
                          className={`flex items-center ${
                            darktheme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <User className="w-3 h-3 mr-2" />
                          <span className="text-sm">{bus.driver.name}</span>
                        </div>
                        <div
                          className={`flex items-center ${
                            darktheme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <Mail className="w-3 h-3 mr-2" />
                          <span className="text-sm truncate">
                            {bus.driver.email}
                          </span>
                        </div>
                        <div
                          className={`flex items-center ${
                            darktheme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <CreditCard className="w-3 h-3 mr-2" />
                          <span className="text-sm">
                            License: {bus.driver.licenceId}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-t pt-4 mt-4 text-center ${
                        darktheme ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm italic ${
                          darktheme ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        No driver assigned
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No buses found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bus;
