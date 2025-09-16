import React from 'react'
import { Button } from "@/components/ui/button"
import { 
  Search, 
  ArrowUpDown, 
  Route, 
  Navigation, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle,
  ArrowLeftRight,
  Zap 
} from 'lucide-react';
import { useState } from 'react';
import { mockBusData } from '../../data/mockBusData';
import { routes } from '../../data/mockBusData';
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from '../shared/Navbar'


const Home = ({ onSearch, onBusSelect }) => {
    const { getAccessTokenSilently } = useAuth0();
  const [searchType, setSearchType] = useState('route'); // 'route' or 'busId'
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [busId, setBusId] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const locations = ['Kolkata Station', 'Esplanade', 'Park Street', 'Sealdah', 'Dumdum', 'Barrackpore'];

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };
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

  const handleSearch = () => {
    if (searchType === 'route' && fromLocation && toLocation) {
      const foundRoutes = routes.filter(route => 
        route.from === fromLocation && route.to === toLocation
      );
      const buses = foundRoutes.flatMap(route => 
        route.buses.map(busId => mockBusData[busId])
      );
      setSearchResults(buses);
    } else if (searchType === 'busId' && busId) {
      const bus = mockBusData[busId.toUpperCase()];
      setSearchResults(bus ? [bus] : []);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <Navbar />
      <header className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Navigation className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  BusTracker Pro
                </h1>
                <p className="text-gray-600 text-sm">Real-time bus tracking system</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live Tracking Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Your Bus</h2>
          
          {/* Search Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-1 flex">
              <button
                onClick={() => setSearchType('route')}
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
                onClick={() => setSearchType('busId')}
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

          {searchType === 'route' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select starting point</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={swapLocations}
                  className="mt-8 p-3 bg-green-100 hover:bg-green-200 rounded-full transition-all duration-300 hover:scale-110"
                  title="Swap locations"
                >
                  <ArrowLeftRight className="w-5 h-5 text-green-600" />
                </button>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select destination</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bus ID</label>
              <input
                type="text"
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
                placeholder="Enter Bus ID (e.g., BUS001)"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center mx-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Buses
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map(bus => (
              <div
                key={bus.id}
                onClick={() => onBusSelect(bus)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-green-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">{bus.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bus.status === 'On Route' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bus.status}
                    </span>
                  </div>
                  <p className="text-green-100 text-sm">{bus.id}</p>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Expected: {bus.expectedTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">{bus.driverName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">{bus.route[0].name} → {bus.route[bus.route.length - 1].name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && (fromLocation && toLocation) || busId ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No buses found</h3>
            <p className="text-gray-500">Try searching with different criteria</p>
          </div>
        ) : null}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">Get live location updates of your bus with precise GPS tracking</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Accurate ETAs</h3>
            <p className="text-gray-600">Know exactly when your bus will arrive at your stop</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Route Planning</h3>
            <p className="text-gray-600">Find the best routes and connections for your journey</p>
          </div>

        </div>
      </main>
      <div> 
        <Button onClick={updateProfile}>
            auth0
        </Button>
      </div>
    </div>
  );
};

export default Home