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
  AlertTriangle,
  Bus
} from 'lucide-react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
// Import our components and services
import Navbar from '../shared/Navbar';
import LocationSearch from '../shared/LocationSearch';
import BusSearchResults from '../shared/BusSearchResults';
import { busSearchService } from '../../services/busSearchService';
import { getBusLocationByDeviceId } from '../../services/operations/busAPI';
import axios  from 'axios';
import EnhancedSearchResults from '../search/EnhancedSearchResults';

const Home = ({ onSearch, onBusSelect }) => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
   const {t, i18n} = useTranslation();
  const [selectedLang, setSelectedLang] = useState(
      localStorage.getItem('selectedLanguage') || 'en'
    );
  
    const LANGUAGES = {
      en: { name: 'English', flag: '🇺🇸' },
      hi: { name: 'हिंदी', flag: '🇮🇳' },
      ta: { name: 'தமிழ்', flag: '🇮🇳' },
      
      bn: { name: 'বাংলা', flag: '🇧🇩' },
       
      pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
      
    };
  
    // Handle language change with i18next
    const handleLanguageChange = (langCode) => {
      if (!langCode) return;
  
      const currentLang = localStorage.getItem('selectedLanguage');
      if (currentLang === langCode) return;
  
      setSelectedLang(langCode);
      localStorage.setItem('selectedLanguage', langCode);
      
      // Change language using i18next
      i18n.changeLanguage(langCode);
    };
  
    // Initialize language on component mount
    useEffect(() => {
      const savedLang = localStorage.getItem('selectedLanguage');
      if (savedLang && savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
        setSelectedLang(savedLang);
      }
    }, [i18n]);

  
  // Search state
  const [searchType, setSearchType] = useState('route'); // 'route', 'busId', 'location', 'busName'
  const [deviceID, setDeviceID] = useState('');
  const [busName, setBusName] = useState(''); // New state for bus name
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const [enhancedSearchResults, setEnhancedSearchResults] = useState(null);
  
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

  // New function to fetch all buses and filter by name
  const searchBusByName = async (name) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/Bus/get/allBus`);
      const data = await response.data;
      // console.log( "ayan",data.data)
      if (data.success && data.data) {
        // Filter buses by name (case-insensitive)
        const filteredBuses = data.data.filter(bus => 
          bus.name.toLowerCase().includes(name.toLowerCase())
        );
        
        return {
          success: true,
          buses: filteredBuses,
          totalFound: filteredBuses.length
        };
      } else {
        return {
          success: false,
          error: "Failed to fetch buses from server"
        };
      }
    } catch (error) {
      console.error("Bus name search error:", error);
      return {
        success: false,
        error: "Error connecting to server"
      };
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

  const handleSearchEnhanced = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    let enhancedResults;
    
    if (searchType === 'route' && fromCoords && toCoords) {
      enhancedResults = await journeyIntegrationService.searchWithFallback(
        fromCoords, 
        toCoords, 
        { radius: 1000, maxResults: 20 }
      );
    } else if (searchType === 'location' && fromCoords) {
      enhancedResults = await journeyIntegrationService.searchNearbyBuses(
        fromCoords, 
        { radius: 1000 }
      );
    } else if (searchType === 'busId' && deviceID.trim()) {
      enhancedResults = await journeyIntegrationService.searchBusById(deviceID.trim());
    }
    
    if (enhancedResults) {
      const formattedResults = journeyIntegrationService.formatResultsForDisplay(enhancedResults);
      setEnhancedSearchResults(formattedResults);
      
      if (!formattedResults.hasResults) {
        setError("No buses or journey options found for your search.");
      }
    }
    
  } catch (err) {
    console.error("Enhanced search error:", err);
    setError("An error occurred while searching. Please try again.");
  } finally {
    setIsLoading(false);
  }
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
        // console.log("Printing fromcor : ",fromCoords);
        // console.log("Printing tiocoords : ",toCoords);
        const result = await busSearchService.findBusesByRoute(fromCoords, toCoords, {
          radius: 1000, // 1km radius
          maxResults: 20
        });
        // console.log("Printing result in home : ",result)
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
          const buses = await busSearchService.findNearbyBuses(fromCoords, 2000);
          const busArray = Array.isArray(buses) ? buses : [];
          
          setSearchResults(busArray);
          setSearchMetadata({
            searchType: 'location',
            coordinates: fromCoords,
            radius: 2000,
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
          // console.log("Bus details response:", busData);

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
            
            // console.log("Setting bus results:", busArray);
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

      } else if (searchType === 'busName' && busName.trim()) {
        // Search for buses by name
        try {
          const result = await searchBusByName(busName.trim());
          // console.log("Bus name search result:", result);

          if (result.success) {
            setSearchResults(result.buses || []);
            setSearchMetadata({
              searchType: 'busName',
              busName: busName.trim(),
              totalFound: result.totalFound
            });

            if (result.buses.length === 0) {
              setError(`No buses found with name "${busName}". Please try a different bus name.`);
            }
          } else {
            setError(result.error || "Failed to search for buses by name.");
            setSearchResults([]);
          }
        } catch (err) {
          console.error("Bus name search error:", err);
          setError("Error searching for buses by name. Please try again.");
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
        } else if (searchType === 'busName') {
          errorMessage += "Enter a valid bus name.";
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
    } else if (searchType === 'busName') {
      return busName.trim().length > 0;
    }
    return false;
  };

  // Handle Enter key press in bus ID input
  const handleBusIdKeyPress = (e) => {
    if (e.key === 'Enter' && canSearch()) {
      handleSearch();
    }
  };

  // Handle Enter key press in bus name input
  const handleBusNameKeyPress = (e) => {
    if (e.key === 'Enter' && canSearch()) {
      handleSearch();
    }
  };

  // Add this method to your Home component
const debugSearch = async () => {
  // console.log("🧪 Running debug tests...");
  
  try {
    // Test endpoint connectivity
    const healthCheck = await fetch(`${import.meta.env.VITE_BASE_URL}/`);
    // console.log("Health check:", healthCheck.status);
    
    // Test bus search service
    const debugResult = await busSearchService.debugEndpoints();
    // console.log("Debug result:", debugResult);
    
    // Test with sample coordinates
    const testFromCoords = { lat: 28.7041, lon: 77.1025 };
    const testToCoords = { lat: 28.5355, lon: 77.3910 };
    
    const routeResult = await busSearchService.findBusesByRoute(
      testFromCoords, 
      testToCoords, 
      { radius: 15000 }
    );
    
    // console.log("Route search result:", routeResult);
    
    setSearchResults(routeResult.buses || []);
    
  } catch (error) {
    console.error("Debug error:", error);
    setError("Debug test failed: " + error.message);
  }
};

// Add debug button to your JSX (temporarily)
{process.env.NODE_ENV === 'development' && (
  <button 
    onClick={debugSearch}
    className="px-4 py-2 bg-purple-500 text-white rounded"
  >
    Debug Test
  </button>
)}

console.log("my reasult ayan" ,searchResults)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
 
            {t('home.subtitle')}
 
            
 
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('home.searchTitle')}</h2>
          
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
                {t('home.byRoute')}
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
                {t('home.nearby')}
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
                {t('home.byBusId')}
              </button>
              <button
                onClick={() => {
                  setSearchType('busName');
                  setError(null);
                  setSearchResults([]);
                }}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  searchType === 'busName'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Bus className="w-4 h-4 inline mr-2" />
                By Bus Name
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
          ) : searchType === 'busId' ? (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('home.busIdLabel')}
              </label>
              <input
                type="text"
                value={deviceID}
                onChange={(e) => setDeviceID(e.target.value)}
                onKeyPress={handleBusIdKeyPress}
                placeholder={t('home.busIdPlaceholder')}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Name
              </label>
              <input
                type="text"
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                onKeyPress={handleBusNameKeyPress}
                placeholder="Enter Bus Name (e.g., L238, 44)"
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
              {isLoading ? t('home.searching') : t('home.searchBuses')}
            </button>
          </div>

          {/* Search Tips */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
 
              {searchType === 'route' && t('home.searchTips.route')}
              {searchType === 'location' && t('home.searchTips.location')}
              {searchType === 'busId' && t('home.searchTips.busId')}

              
              {searchType === 'busName' && "Enter the bus name to find all buses with that name"}
 
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('home.features.realTime.title')}</h3>
              <p className="text-gray-600 text-sm">
                {t('home.features.realTime.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('home.features.accurateEta.description')}</h3>
              <p className="text-gray-600 text-sm">
                {t('home.features.accurateEta.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Route className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('home.features.routeOptimization.description')}</h3>
              <p className="text-gray-600 text-sm">
                {t('home.features.routeOptimization.description')}
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

        <EnhancedSearchResults
          enhancedResults={enhancedSearchResults}
          isLoading={isLoading}
          searchType={searchType}
          onBusSelect={handleBusSelect}
          error={error}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium mb-1">{t('home.errors.searchError')}</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
 
          <p>&copy; {t('home.footer')}</p>
 
          <Button onClick={updateProfile}></Button>
 
        </footer>
      </main>
    </div>
  );
};

export default Home;