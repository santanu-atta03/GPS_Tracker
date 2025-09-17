// components/page/BusDetailsPage.jsx
import { useRef, useState, useEffect } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import MapComponent from "../map/MapComponent";
import { 
  ChevronLeft, 
  Clock, 
  User, 
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getBusLocationByDeviceId } from "../../services/operations/busAPI";

const BusDetailsPage = () => {
  const [busDetails, setBusDetails] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const previousLocationRef = useRef(null);
  const { deviceID } = useParams();
  const navigate = useNavigate();
  
  console.log("Device id:", deviceID);

  useEffect(() => {
    if (!deviceID) {
      setError("No bus ID provided");
      setIsLoading(false);
      return;
    }

    const fetchBusDetails = async () => {
      try {
        console.log("Fetching bus details for:", deviceID);
        const response = await getBusLocationByDeviceId(deviceID);
        console.log("Bus details response:", response);

        if (!response) {
          setError(`Bus with ID "${deviceID}" not found`);
          setIsLoading(false);
          return;
        }

        // Handle the transformed data structure
        const newLocation = response.location?.coordinates;

        // Compare previous location with new location (both arrays)
        const prev = previousLocationRef.current;

        const locationChanged =
          !prev ||
          !newLocation ||
          prev[0] !== newLocation[0] ||
          prev[1] !== newLocation[1];

        if (locationChanged && newLocation) {
          previousLocationRef.current = newLocation;
          setBusDetails(response);
        } else if (!busDetails) {
          // First time loading
          setBusDetails(response);
        }

        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error("Could not fetch bus details", err);
        setError("Failed to fetch bus details. Please try again.");
        setIsLoading(false);
      }
    };

    // Initial fetch immediately
    fetchBusDetails();

    // Poll every 10 seconds (10000 ms)
    const intervalId = setInterval(fetchBusDetails, 10000);

    // Cleanup interval on unmount or deviceID change
    return () => clearInterval(intervalId);
  }, [deviceID]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading bus details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 ml-4">Bus Details</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Error Loading Bus Details</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No bus data
  if (!busDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        <header className="bg-white shadow-lg border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 ml-4">Bus Not Found</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Bus Not Found</h3>
            <p className="text-gray-500 mb-4">No bus found with ID: {deviceID}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Search for Buses
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'on route':
        return 'bg-green-100 text-green-800';
      case 'at stop':
      case 'stopped':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {busDetails.name || busDetails.busName}
                </h1>
                <p className="text-gray-600">{busDetails.deviceID}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${getStatusColor(busDetails.status)}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  busDetails.status === 'Active' || busDetails.status === 'On Route' 
                    ? 'bg-green-500' : 'bg-yellow-500'
                } animate-pulse`}></div>
                <span className="font-medium">{busDetails.status}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Bus Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Time Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Schedule Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Start Time</span>
                  <span className="font-semibold text-gray-800">{busDetails.startTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Expected Arrival</span>
                  <span className="font-semibold text-green-600">{busDetails.expectedTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Destination Time</span>
                  <span className="font-semibold text-gray-800">{busDetails.destinationTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Current Time</span>
                  <span className="font-semibold text-blue-600">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Driver Details</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{busDetails.driverName}</h4>
                  <p className="text-gray-600 text-sm">Licensed Driver</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <span className="text-sm font-medium">Phone: {busDetails.driverPhone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">Experience: Professional</span>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Route Information</h3>
              <div className="space-y-3">
                {busDetails.route && busDetails.route.length > 0 ? (
                  busDetails.route.slice(0, 5).map((stop, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        index === 0 ? 'bg-green-500' : 
                        index === busDetails.route.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-gray-700">
                        {stop.name || `Stop ${index + 1}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">
                    Route information not available
                  </div>
                )}
                {busDetails.route && busDetails.route.length > 5 && (
                  <div className="text-gray-500 text-sm">
                    +{busDetails.route.length - 5} more stops
                  </div>
                )}
              </div>
            </div>

            {/* Last Updated Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-800">
                    {busDetails.lastUpdated 
                      ? new Date(busDetails.lastUpdated).toLocaleString()
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location</span>
                  <span className="text-sm text-gray-800">
                    {busDetails.location?.coordinates 
                      ? `${busDetails.location.coordinates[1].toFixed(4)}, ${busDetails.location.coordinates[0].toFixed(4)}`
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Live Route Tracking</h3>
                <div className="flex items-center space-x-2 bg-green-50 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live</span>
                </div>
              </div>
              
              {busDetails.location?.coordinates ? (
                <MapComponent
                  routeCoords={busDetails.route || []}
                  currentLocation={busDetails.location.coordinates}
                  busId={busDetails.deviceID}
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Location data not available</p>
                  </div>
                </div>
              )}
              
              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">--</div>
                  <div className="text-sm text-gray-600">km/h</div>
                  <div className="text-xs text-gray-500">Speed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">--</div>
                  <div className="text-sm text-gray-600">min</div>
                  <div className="text-xs text-gray-500">ETA</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">--</div>
                  <div className="text-sm text-gray-600">km</div>
                  <div className="text-xs text-gray-500">Distance</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">--</div>
                  <div className="text-sm text-gray-600">stops</div>
                  <div className="text-xs text-gray-500">Remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusDetailsPage;