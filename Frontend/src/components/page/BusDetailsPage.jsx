import { useRef, useState } from "react";
import { useEffect } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import MapComponent from "../map/MapComponent";
import { 
  ChevronLeft, 
  Clock, 
  User, 
  MapPin 
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { getBusLocationByDeviceId } from "../../services/operations/busAPI";

const BusDetailsPage = () => {
  const [busDetails, setBusDetails] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const previousLocationRef = useRef(null);
  const [bus,setBus] = useState();
  const {deviceID} = useParams();
  const navigate = useNavigate()
  console.log("Device id : ",deviceID)
  useEffect(() => {
    if (!deviceID) return;

    const fetchBusDetails = async () => {
      try {
        // Replace this with your actual fetch function
        const response = await getBusLocationByDeviceId(deviceID);
        console.log("Printing response in bus : ",response)
        setBus(response);
        console.log("Setting bus : ",bus)
        if (!response) return;

        const newLocation = response.location.coordinates;

        // Compare previous location with new location (both arrays)
        const prev = previousLocationRef.current;

        const locationChanged =
          !prev ||
          prev[0] !== newLocation[0] ||
          prev[1] !== newLocation[1];

        if (locationChanged) {
          previousLocationRef.current = newLocation;
          setBusDetails(response);
        }
      } catch (err) {
        console.error("Could not fetch bus details", err);
      }
    };

    // Initial fetch immediately
    fetchBusDetails();

    // Poll every 1 second (1000 ms)
    const intervalId = setInterval(fetchBusDetails, 10000);

    // Cleanup interval on unmount or deviceID change
    return () => clearInterval(intervalId);
  }, [deviceID]);
  console.log("Bus details : ", bus)

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
                <h1 className="text-2xl font-bold text-gray-800">{bus?.name}</h1>
                <p className="text-gray-600">{bus?.id}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${
              bus?.status === 'On Route' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  bus?.status === 'On Route' ? 'bg-green-500' : 'bg-yellow-500'
                } animate-pulse`}></div>
                <span className="font-medium">{bus?.status}</span>
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
                  <span className="font-semibold text-gray-800">{bus?.startTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Expected Arrival</span>
                  <span className="font-semibold text-green-600">{bus?.expectedTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Destination Time</span>
                  <span className="font-semibold text-gray-800">{bus?.destinationTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Current Time</span>
                  <span className="font-semibold text-blue-600">
                    {currentTime?.toLocaleTimeString()}
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
                  <h4 className="font-semibold text-gray-800">{bus?.driverName}</h4>
                  <p className="text-gray-600 text-sm">Licensed Driver</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <span className="text-sm font-medium">Phone: {bus?.driverPhone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">Experience: 8+ years</span>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Route Stops</h3>
              <div className="space-y-3">
                {bus?.route.map((stop, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-red-500' : 
                      index === bus?.route.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-gray-700">{stop.name}</span>
                  </div>
                ))}
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
              
               <MapComponent
                  routeCoords={bus?.route}
                  currentLocation={bus?.location.coordinates}
                  busId={bus?.deviceID}
                />
              
              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">12</div>
                  <div className="text-sm text-gray-600">km/h</div>
                  <div className="text-xs text-gray-500">Speed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">min</div>
                  <div className="text-xs text-gray-500">ETA</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2.3</div>
                  <div className="text-sm text-gray-600">km</div>
                  <div className="text-xs text-gray-500">Distance</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">28</div>
                  <div className="text-sm text-gray-600">passengers</div>
                  <div className="text-xs text-gray-500">On Board</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusDetailsPage