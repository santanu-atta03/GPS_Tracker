import React, { useEffect, useState } from "react";
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

const Bus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        const res = await axios.get(
          "https://gps-tracker-kq2q.vercel.app/api/v1/driver/allBus",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBuses(res.data.AllBus || []);
      } catch (error) {
        console.error("Error fetching buses:", error);
        setError("Failed to fetch buses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [getAccessTokenSilently]);

  const handleCreateBus = () => {
    navigate("/createbus");
  };

  const handleBusClick = (bus) => {
    // Navigate to bus details if needed
    navigate(`/bus/${bus.deviceID}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">All Buses</h1>
            <p className="text-lg text-gray-600">
              Manage and monitor your fleet of buses
            </p>
          </div>

          <button
            onClick={handleCreateBus}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Bus
          </button>
        </div>

        {/* Stats Section */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BusIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {buses.length}
              </h3>
              <p className="text-gray-600 text-sm">Total Buses</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {buses.filter((bus) => bus.driver).length}
              </h3>
              <p className="text-gray-600 text-sm">Assigned Drivers</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Route className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {new Set(buses.map((bus) => `${bus.from}-${bus.to}`)).size}
              </h3>
              <p className="text-gray-600 text-sm">Active Routes</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading buses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium mb-1">
                  Error Loading Buses
                </h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buses Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.length > 0 ? (
              buses.map((bus) => (
                <div
                  key={bus._id}
                  onClick={() => handleBusClick(bus)}
                  className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {/* Bus Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <BusIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {bus.deviceID}
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bus.driver
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {bus.driver ? "Active" : "Unassigned"}
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">From:</span>
                        <p className="text-sm truncate">{bus.from}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <Navigation className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">To:</span>
                        <p className="text-sm truncate">{bus.to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information */}
                  {bus.driver ? (
                    <div className="border-t pt-4 mt-4 bg-gray-50 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Driver Details
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <User className="w-3 h-3 mr-2 text-gray-400" />
                          <span className="text-sm">{bus.driver.name}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          <span className="text-sm truncate">
                            {bus.driver.email}
                          </span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <CreditCard className="w-3 h-3 mr-2 text-gray-400" />
                          <span className="text-sm">
                            License: {bus.driver.licenceId}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4 mt-4 text-center">
                      <p className="text-sm text-gray-500 italic">
                        No driver assigned
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BusIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Buses Found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't created any buses yet. Click the button below to
                    add your first bus.
                  </p>
                  <button
                    onClick={handleCreateBus}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105 flex items-center mx-auto"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Bus
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Bus Tracker. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Bus;
