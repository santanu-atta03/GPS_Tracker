import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Route,
  AlertTriangle,
  RefreshCw,
  Locate
} from 'lucide-react';
import Navbar from "../shared/Navbar";

// Helper to create a custom marker with bus emoji
const createBusIcon = (isActive = true) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${isActive ? '#16a34a' : '#6b7280'}; 
      color: white; 
      font-size: 20px; 
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    ">🚌</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom user location icon
const createUserIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #3b82f6; 
      color: white; 
      font-size: 16px; 
      width: 28px; 
      height: 28px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    ">📍</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const BusMap = () => {
  const [userLocation, setUserLocation] = useState([22.5726, 88.3639]); // default Kolkata
  const [busLocations, setBusLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          setLocationError(null);
        },
        (err) => {
          console.error("Error getting location:", err);
          setLocationError("Could not get your location. Using default location (Kolkata).");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Fetch all bus details
  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        setError(null);
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/AllLocation`);
        setBusLocations(res.data.buses || []);
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bus locations:", error);
        setError("Failed to load bus locations. Please try again.");
        setIsLoading(false);
      }
    };

    // Call immediately once
    fetchBusLocations();

    // Set interval for every 5 sec
    const interval = setInterval(fetchBusLocations, 5000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/AllLocation`);
      setBusLocations(res.data.buses || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      setError("Failed to refresh bus locations.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get current user location again
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          setLocationError(null);
        },
        (err) => {
          setLocationError("Could not get your current location.");
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Live Bus Map
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track all buses in real-time on the interactive map. See their current locations, 
            routes, and driver information.
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1 text-green-500" />
                <span className="font-medium">{busLocations.length}</span> buses tracked
              </div>
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleGetCurrentLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center text-sm"
              >
                <Locate className="w-4 h-4 mr-1" />
                My Location
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium mb-1">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {locationError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-800 font-medium mb-1">Location Notice</h3>
                <p className="text-yellow-700 text-sm">{locationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          <div className="relative">
            {isLoading && (
              <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin text-green-500" />
                <span className="text-sm text-gray-600">Loading buses...</span>
              </div>
            )}
            
            <MapContainer
              center={userLocation}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "600px", width: "100%" }}
              className="rounded-2xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User Marker */}
              <Marker position={userLocation} icon={createUserIcon()}>
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h3 className="font-bold text-blue-600 mb-1">📍 Your Location</h3>
                    <p className="text-sm text-gray-600">You are here</p>
                  </div>
                </Popup>
              </Marker>

              {/* Bus Markers */}
              {busLocations.map((bus, index) => {
                const lastUpdatedTime = new Date(bus.location.lastUpdated);
                const now = new Date();
                const minutesAgo = Math.floor((now - lastUpdatedTime) / (1000 * 60));
                const isRecent = minutesAgo < 10; // Consider bus active if updated within 10 minutes

                return (
                  <Marker
                    key={bus.deviceID || index}
                    position={[
                      bus.location.coordinates[0],
                      bus.location.coordinates[1],
                    ]}
                    icon={createBusIcon(isRecent)}
                  >
                    <Popup className="custom-popup" maxWidth={300}>
                      <div className="p-3">
                        <h3 className="font-bold text-green-600 mb-3 text-lg flex items-center">
                          🚌 {bus.deviceID}
                          {!isRecent && (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <Route className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Route:</span>
                              <p className="text-gray-600">{bus.from} → {bus.to}</p>
                            </div>
                          </div>
                          
                          {bus.driver && (
                            <div className="flex items-start">
                              <User className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700">Driver:</span>
                                <p className="text-gray-600">
                                  {bus.driver.name} ({bus.driver.experience})
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-start">
                            <Clock className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Last Updated:</span>
                              <p className="text-gray-600">
                                {minutesAgo === 0 ? 'Just now' : `${minutesAgo} min ago`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lastUpdatedTime.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Navigation className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Coordinates:</span>
                              <p className="text-gray-600 font-mono text-xs">
                                {bus.location.coordinates.join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                            Track This Bus
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-green-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                📍
              </div>
              <div>
                <p className="font-medium text-gray-700">Your Location</p>
                <p className="text-sm text-gray-500">Current GPS position</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                🚌
              </div>
              <div>
                <p className="font-medium text-gray-700">Active Bus</p>
                <p className="text-sm text-gray-500">Updated within 10 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                🚌
              </div>
              <div>
                <p className="font-medium text-gray-700">Inactive Bus</p>
                <p className="text-sm text-gray-500">Last seen over 10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Bus Tracker. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default BusMap;