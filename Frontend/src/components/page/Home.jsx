// components/Home.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Route, 
  Navigation, 
  Clock, 
  Zap,
  MapPin,
  AlertTriangle 
} from 'lucide-react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';

// Import our components and services
import Navbar from '../shared/Navbar';
import LocationSearch from '../shared/LocationSearch';
import BusSearchResults from '../shared/BusSearchResults';
import { busSearchService } from '../../services/busSearchService';
import { getBusLocationByDeviceId } from '../../services/operations/busAPI';

const Home = ({ onSearch, onBusSelect }) => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  // Search state
  const [searchType, setSearchType] = useState('route'); // 'route', 'busId', 'location'
  const [deviceID, setDeviceID] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  
  // Location state
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');

  // Auth0 test function
  const updateProfile = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      console.log(token);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle coordinates selection from LocationSearch
  const handleCoordsSelect = ({ from, to, fromAddress, toAddress }) => {
    setFromCoords(from);
    setToCoords(to);
    setFromAddress(fromAddress || '');
    setToAddress(toAddress || '');
  };

  // Handle location changes from LocationSearch
  const handleLocationChange = (type, locationData) => {
    if (type === 'from') {
      setFromCoords(locationData.coords);
      setFromAddress(locationData.address);
    } else if (type === 'to') {
      setToCoords(locationData.coords);
      setToAddress(locationData.address);
    }
  };

  // Handle bus selection
  const handleBusSelect = (bus) => {
    if (onBusSelect) {
      onBusSelect(bus);
    }
    // Navigate to bus details page using the correct device ID property
    const deviceId = bus.deviceID || bus.deviceId || bus.id;
    navigate(`/bus/${deviceId}`);
  };

  // Main search function
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setSearchMetadata(null);

    try {
      if (searchType === 'route' && fromCoords && toCoords) {
        // Search for buses along a route
        console.log("Printing fromcor : ",fromCoords);
        console.log("Printing tiocoords : ",toCoords);
        const result = await busSearchService.findBusesByRoute(fromCoords, toCoords, {
          radius: 1000, // 1km radius
          maxResults: 20
        });
        console.log("Printing result in home : ",result)
        if (result.success) {
          setSearchResults(result.buses || []);
          setSearchMetadata(result.metadata);
          
          if (!result.buses || result.buses.length === 0) {
            setError("No buses found for this route. The buses might not be currently operating on this path or try searching with nearby locations.");
          }
        } else {
          setError(result.error || "Failed to search for buses along this route.");
        }

      } else if (searchType === 'location' && fromCoords) {
        // Search for buses near a single location
        try {
          const buses = await busSearchService.findNearbyBuses(fromCoords, 1000);
          const busArray = Array.isArray(buses) ? buses : [];
          
          setSearchResults(busArray);
          setSearchMetadata({
            searchType: 'location',
            coordinates: fromCoords,
            radius: 1000,
            totalFound: busArray.length
          });

          if (busArray.length === 0) {
            setError("No buses found in this area. Try searching in a different location or check back later.");
          }
        } catch (err) {
          console.error("Location search error:", err);
          setError("Error searching for buses in this area. Please try again.");
        }

      } else if (searchType === 'busId' && deviceID.trim()) {
        // Search for a specific bus by ID
        try {
          const busData = await getBusLocationByDeviceId(deviceID.trim());
          console.log("Bus details response:", busData);

          // Handle the API response structure
          if (busData && busData !== null) {
            // Ensure we're always setting an array
            const busArray = Array.isArray(busData) ? busData : [busData];
            
            setSearchResults(busArray);
            setSearchMetadata({
              searchType: 'busId',
              deviceId: deviceID.trim(),
              totalFound: busArray.length
            });
            
            console.log("Setting bus results:", busArray);
          } else {
            setError(`Bus with ID "${deviceID}" not found. Please check the bus ID and try again.`);
            setSearchResults([]);
          }
        } catch (err) {
          console.error("Bus ID search error:", err);
          if (err.response?.status === 404 || err.message.includes('not found')) {
            setError(`Bus with ID "${deviceID}" not found. Please check the bus ID and try again.`);
          } else {
            setError("Error searching for bus. Please check the bus ID and try again.");
          }
          setSearchResults([]);
        }

      } else {
        // Invalid search parameters
        let errorMessage = "Please provide valid search parameters: ";
        if (searchType === 'route') {
          errorMessage += "Select both starting point and destination.";
        } else if (searchType === 'location') {
          errorMessage += "Select a location to search nearby buses.";
        } else if (searchType === 'busId') {
          errorMessage += "Enter a valid bus ID.";
        }
        setError(errorMessage);
      }

    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if search can be performed
  const canSearch = () => {
    if (searchType === 'route') {
      return fromCoords && toCoords;
    } else if (searchType === 'location') {
      return fromCoords;
    } else if (searchType === 'busId') {
      return deviceID.trim().length > 0;
    }
    return false;
  };

  // Handle Enter key press in bus ID input
  const handleBusIdKeyPress = (e) => {
    if (e.key === 'Enter' && canSearch()) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Find Your Perfect Bus Route
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for buses by route, location, or bus ID. Get real-time information 
            and track your journey with ease.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Your Bus</h2>
          
          {/* Search Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-2 flex transition-all duration-200 flex-wrap">
              <button
                onClick={() => {
                  setSearchType('route');
                  setError(null);
                  setSearchResults([]);
                }}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  searchType === 'route'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Route className="w-4 h-4 inline mr-2" />
                By Route
              </button>
              <button
                onClick={() => {
                  setSearchType('location');
                  setError(null);
                  setSearchResults([]);
                }}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  searchType === 'location'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Nearby
              </button>
              <button
                onClick={() => {
                  setSearchType('busId');
                  setError(null);
                  setSearchResults([]);
                }}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  searchType === 'busId'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Navigation className="w-4 h-4 inline mr-2" />
                By Bus ID
              </button>
            </div>
          </div>

          {/* Search Input based on type */}
          {(searchType === 'route' || searchType === 'location') ? (
            <LocationSearch
              onCoordsSelect={handleCoordsSelect}
              onLocationChange={handleLocationChange}
              searchType={searchType}
            />
          ) : (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus ID
              </label>
              <input
                type="text"
                value={deviceID}
                onChange={(e) => setDeviceID(e.target.value)}
                onKeyPress={handleBusIdKeyPress}
                placeholder="Enter Bus ID (e.g., BUS-1234)"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Search Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleSearch}
              disabled={!canSearch() || isLoading}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg transform flex items-center mx-auto ${
                canSearch() && !isLoading
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Search className="w-5 h-5 mr-2" />
              {isLoading ? 'Searching...' : 'Search Buses'}
            </button>
          </div>

          {/* Search Tips */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {searchType === 'route' && "Select starting point and destination to find buses along your route"}
              {searchType === 'location' && "Choose a location to find nearby buses"}
              {searchType === 'busId' && "Enter the specific bus ID to track a particular bus"}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        {searchResults.length === 0 && !error && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600 text-sm">
                Get live updates on bus locations and arrival times
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Accurate ETAs</h3>
              <p className="text-gray-600 text-sm">
                Plan your journey with precise arrival predictions
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Route className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Route Optimization</h3>
              <p className="text-gray-600 text-sm">
                Find the best routes for your daily commute
              </p>
            </div>
          </div>
        )}

        {/* Search Results */}
        <BusSearchResults
          searchResults={searchResults}
          isLoading={isLoading}
          searchType={searchType}
          searchMetadata={searchMetadata}
          onBusSelect={handleBusSelect}
          error={error}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium mb-1">Search Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
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

export default Home;