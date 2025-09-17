// import React from 'react'
// import { Button } from "@/components/ui/button"
// import { 
//   Search, 
//   ArrowUpDown, 
//   Route, 
//   Navigation, 
//   Clock, 
//   User, 
//   MapPin, 
//   AlertCircle,
//   ArrowLeftRight,
//   Zap 
// } from 'lucide-react';
// import { useState } from 'react';
// import { mockBusData } from '../../data/mockBusData';
// import { routes } from '../../data/mockBusData';
// import { useAuth0 } from "@auth0/auth0-react";
// import Navbar from '../shared/Navbar'
// import { getBusLocationByDeviceId } from '../../services/operations/busAPI';
// import { useNavigate } from 'react-router-dom';
// import LocationSearch from '../shared/LocationSearch';

 

// const Home = ({ onSearch, onBusSelect }) => {
//     const { getAccessTokenSilently } = useAuth0();
 
//   const [searchType, setSearchType] = useState('route'); // 'route' or 'busId'
//   const [deviceID, setdeviceID] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const navigate = useNavigate();
//   const locations = ['Kolkata Station', 'Esplanade', 'Park Street', 'Sealdah', 'Dumdum', 'Barrackpore'];
//   const [coords, setCoords] = useState(null);
//   const [buses, setBuses] = useState([]);

//   const [fromCoords, setFromCoords] = useState(null);
//   const [toCoords, setToCoords] = useState(null);
//   const [fromLocation, setFromLocation] = useState("");
//   const [toLocation, setToLocation] = useState("");
//   const swapLocations = () => {
//     const temp = fromLocation;
//     setFromLocation(toLocation);
//     setToLocation(temp);
//   };
//    const updateProfile = async () => {
//     try {
//       const token = await getAccessTokenSilently({
//         audience: "http://localhost:5000/api/v3",
//       });
//       console.log(token);
      
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleSearch = async () => {
//   if (searchType === 'route' && fromLocation && toLocation) {
//     const foundRoutes = routes.filter(route => 
//       route.from.toLowerCase() === fromLocation.toLowerCase() && 
//       route.to.toLowerCase() === toLocation.toLowerCase()
//     );

//     const buses = foundRoutes.flatMap(route => 
//       route.buses.map(deviceID => mockBusData[deviceID])
//     );

//     setSearchResults(buses);

//   } else if (searchType === 'busId' && deviceID) {
//     try {
//       const response = await getBusLocationByDeviceId(deviceID);
//       console.log("Bus details response: ", response);

//       setSearchResults(response.success ? [response?.latestLocations] : []);

//     } catch (err) {
//       console.error("Could not fetch bus details", err);
//     }

//   } else if (searchType === "location" && fromCoords) {
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BASE_URL}/get/search?lat=${fromCoords.lat}&lng=${fromCoords.lon}&radius=1000`
//       );
//       const data = await res.json();
//       setSearchResults(data);
//     } catch (err) {
//       console.error("Could not fetch nearby buses", err);
//     }
//   }
// };


//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
//       <Navbar />

//       <main className="max-w-7xl mx-auto px-4 py-8">
//         {/* Search Section */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Your Bus</h2>
          
//           {/* Search Type Toggle */}
//           <div className="flex justify-center mb-6">
//             <div className="bg-gray-100 rounded-full p-2 flex transition-all duration-200">
//               <button
//                 onClick={() => setSearchType('route')}
//                 className={`px-6 py-2 rounded-full transition-all duration-300 ${
//                   searchType === 'route'
//                     ? 'bg-green-500 text-white shadow-lg'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 <Route className="w-4 h-4 inline mr-2" />
//                 By Route
//               </button>
//               <button
//                 onClick={() => setSearchType('busId')}
//                 className={`px-6 py-2 rounded-full transition-all duration-300 ${
//                   searchType === 'busId'
//                     ? 'bg-green-500 text-white shadow-lg'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 <Navigation className="w-4 h-4 inline mr-2" />
//                 By Bus ID
//               </button>
//             </div>
//           </div>

//           {searchType === 'route' || searchType === 'location' ? (
//             <LocationSearch
//         onCoordsSelect={({ from, to }) => {
//           setFromCoords(from);
//           setToCoords(to);

//           if (from) setFromLocation(from.display_name || from.name || "");
//           if (to) setToLocation(to.display_name || to.name || "");
//         }}
//       />
//           ) : (
//             <div className="max-w-md mx-auto">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Bus ID</label>
//               <input
//                 type="text"
//                 value={deviceID}
//                 onChange={(e) => setdeviceID(e.target.value)}
//                 placeholder="Enter Bus ID (e.g., BUS001)"
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
//               />
//             </div>
//           )}

//           <div className="text-center mt-6">
//             <button
//               onClick={handleSearch}
//               className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center mx-auto"
//             >
//               <Search className="w-5 h-5 mr-2" />
//               Search Buses
//             </button>
//           </div>
//         </div>

//         {/* Search Results */}
//         {searchResults.length > 0 && (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {searchResults.map(bus => (
//               <div
//                 key={bus.id}
//                 onClick={() => navigate(`/bus/${bus.deviceID}`)}
//                 className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-green-100 overflow-hidden"
//               >
//                 <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-white font-bold text-lg">{bus.name}</h3>
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       bus.status === 'On Route' 
//                         ? 'bg-green-100 text-green-800' 
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}>
//                       {bus.status}
//                     </span>
//                   </div>
//                   <p className="text-green-100 text-sm">{bus.id}</p>
//                 </div>
                
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center text-gray-600">
//                     <Clock className="w-4 h-4 mr-2 text-green-500" />
//                     <span className="text-sm">Expected: {bus.expectedTime}</span>
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <User className="w-4 h-4 mr-2 text-green-500" />
//                     <span className="text-sm">{bus.driverName}</span>
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <MapPin className="w-4 h-4 mr-2 text-green-500" />
//                     <span className="text-sm">{bus.route[0].name} → {bus.route[bus.route.length - 1].name}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {searchResults.length === 0 && (fromLocation && toLocation) || deviceID ? (
//           <div className="text-center py-12">
//             <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-gray-600 mb-2">No buses found</h3>
//             <p className="text-gray-500">Try searching with different criteria</p>
//           </div>
//         ) : null}

//         {/* Features Section */}
//         <div className="mt-16 grid md:grid-cols-3 gap-8">
//           <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Zap className="w-8 h-8 text-green-600" />
//             </div>
//             <h3 className="text-lg font-bold text-gray-800 mb-2">Real-time Tracking</h3>
//             <p className="text-gray-600">Get live location updates of your bus with precise GPS tracking</p>
//           </div>
          
//           <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Clock className="w-8 h-8 text-green-600" />
//             </div>
//             <h3 className="text-lg font-bold text-gray-800 mb-2">Accurate ETAs</h3>
//             <p className="text-gray-600">Know exactly when your bus will arrive at your stop</p>
//           </div>
          
//           <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Navigation className="w-8 h-8 text-green-600" />
//             </div>
//             <h3 className="text-lg font-bold text-gray-800 mb-2">Route Planning</h3>
//             <p className="text-gray-600">Find the best routes and connections for your journey</p>
//           </div>

//         </div>
//       </main>
//       <div> 
//         <Button onClick={updateProfile}>
//             auth0
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Home




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

// Import our new components and services
import Navbar from '../shared/Navbar';
import LocationSearch from './LocationSearch';
import BusSearchResults from './BusSearchResults';
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
    // Navigate to bus details page
    navigate(`/bus/${bus.deviceID}`);
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
        const result = await busSearchService.findBusesByRoute(fromCoords, toCoords, {
          radius: 1000, // 1km radius
          maxResults: 20
        });

        if (result.success) {
          setSearchResults(result.buses);
          setSearchMetadata(result.metadata);
          
          if (result.buses.length === 0) {
            setError("No buses found for this route. The buses might not be currently operating on this path or try searching with nearby locations.");
          }
        } else {
          setError(result.error || "Failed to search for buses along this route.");
        }

      } else if (searchType === 'location' && fromCoords) {
        // Search for buses near a single location
        const buses = await busSearchService.findNearbyBuses(fromCoords, 1000);
        setSearchResults(buses);
        setSearchMetadata({
          searchType: 'location',
          coordinates: fromCoords,
          radius: 1000,
          totalFound: buses.length
        });

        if (buses.length === 0) {
          setError("No buses found in this area. Try searching in a different location or check back later.");
        }

      } else if (searchType === 'busId' && deviceID.trim()) {
        // Search for a specific bus by ID
        const response = await getBusLocationByDeviceId(deviceID.trim());
        console.log("Bus details response:", response);

        if (response.success && response.latestLocations) {
          setSearchResults([response.latestLocations]);
          setSearchMetadata({
            searchType: 'busId',
            deviceId: deviceID.trim(),
            totalFound: 1
          });
        } else {
          setError(`Bus with ID "${deviceID}" not found. Please check the bus ID and try again.`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
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
                placeholder="Enter Bus ID (e.g., BUS001)"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && canSearch()) {
                    handleSearch();
                  }
                }}
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

        {/* Search Results */}
        <BusSearchResults
          searchResults={searchResults}
          isLoading={isLoading}
          searchType={searchType}
          searchMetadata={searchMetadata}
          onBusSelect={handleBusSelect}
          error={error}
        />

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

      {/* Auth0 Test Button (for development) */}
      <div className="fixed bottom-4 right-4">
        <Button onClick={updateProfile} variant="outline" size="sm">
          Test Auth0
        </Button>
      </div>
    </div>
  );
};

export default Home;