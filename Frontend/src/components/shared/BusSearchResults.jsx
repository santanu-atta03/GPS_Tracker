// components/search/BusSearchResults.jsx
import React from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  Navigation,
  Route,
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Phone,
  Activity 
} from 'lucide-react';
import BusSearchDebug from './BusSearchDebug';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useState } from 'react';
const BusCard = ({ bus, onBusSelect, searchType, searchMetadata }) => {
 
  const handleClick = () => {
    if (onBusSelect) {
      onBusSelect(bus);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on route':
      case 'active':
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

  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    } else {
      return `${(meters / 1000).toFixed(1)}km away`;
    }
  };

  const getRouteInfo = () => {
    if (bus.route && bus.route.length > 0) {
      // If route has named stops
      if (bus.route[0].name && bus.route[bus.route.length - 1].name) {
        return `${bus.route[0].name} → ${bus.route[bus.route.length - 1].name}`;
      }
      // If route only has coordinates
      return `${bus.route.length} route points`;
    }
    return 'Route information unavailable';
  };

  const getRouteMatchInfo = () => {
    if (!bus.routeMatch && !bus.routeAnalysis) return null;
    
    const analysis = bus.routeMatch || bus.routeAnalysis;
    
    if (analysis.passesThrough) {
      return {
        type: 'passes-through',
        text: 'Passes through your route',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle
      };
    }
    
    if (analysis.isCorrectDirection && analysis.score > 0.3) {
      return {
        type: 'good-direction',
        text: 'Goes in your direction',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: ArrowRight
      };
    }
    
    if (analysis.score > 0.2) {
      return {
        type: 'nearby',
        text: 'Nearby route',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: TrendingUp
      };
    }
    
    return null;
  };

  const getRelevanceScore = () => {
    const analysis = bus.routeMatch || bus.routeAnalysis;
    if (!analysis || analysis.score === undefined) return null;
    
    const percentage = Math.round(analysis.score * 100);
    if (percentage < 20) return null;
    
    return {
      score: percentage,
      color: percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-blue-600' : 'text-orange-600'
    };
  };

  // Handle different possible data structures
  const deviceId = bus.deviceID || bus.deviceId || bus.id || 'Unknown';
  const busName = bus.name || bus.busName || `Bus ${deviceId}`;
  const busStatus = bus.status || 'Unknown';
  const driverName = bus.driverName || bus.driver;
  const driverPhone = bus.driverPhone;
  const currentLocation = bus.currentLocation || bus.location;
  const lastUpdated = bus.lastUpdated || bus.timestamp || bus.updatedAt;
  const routeMatchInfo = getRouteMatchInfo();
  const relevanceScore = getRelevanceScore();



    const {t, i18n} = useTranslation();
    const [selectedLang, setSelectedLang] = useState(
        localStorage.getItem('selectedLanguage') || 'en'
      );
    
      const LANGUAGES = {
        en: { name: 'English', flag: '🇺🇸' },
        hi: { name: 'हिंदी', flag: '🇮🇳' },
        ta: { name: 'தமிழ்', flag: '🇮🇳' },
        te: { name: 'తెలుగు', flag: '🇮🇳' },
        kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        ml: { name: 'മലയാളം', flag: '🇮🇳' },
        bn: { name: 'বাংলা', flag: '🇧🇩' },
        gu: { name: 'ગુજરાતી', flag: '🇮🇳' },
        mr: { name: 'मराठी', flag: '🇮🇳' },
        pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        ur: { name: 'اردو', flag: '🇵🇰' }
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

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-green-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">
              {busName}
            </h3>
            <p className="text-green-100 text-sm">{deviceId}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(busStatus)}`}>
              {busStatus}
            </span>
            {bus.distanceFromSearch && (
              <p className="text-green-100 text-xs mt-1">
                {formatDistance(bus.distanceFromSearch)}
              </p>
            )}
            {relevanceScore && (
              <p className={`text-xs mt-1 font-medium ${relevanceScore.color === 'text-green-600' ? 'text-green-200' : 'text-green-100'}`}>
                {relevanceScore.score}% match
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Route Match Info */}
        {routeMatchInfo && (
          <div className={`flex items-center p-2 rounded-lg ${routeMatchInfo.bgColor}`}>
            <routeMatchInfo.icon className={`w-4 h-4 mr-2 ${routeMatchInfo.color} flex-shrink-0`} />
            <span className={`text-sm font-medium ${routeMatchInfo.color}`}>
              {routeMatchInfo.text}
            </span>
          </div>
        )}

        {/* Route Information */}
        <div className="flex items-center text-gray-600">
          <Route className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
          <span className="text-sm">{getRouteInfo()}</span>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
          {bus.startTime && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
              <span>{t('busResults.startTime')} {bus.startTime}</span>
            </div>
          )}
          {bus.expectedTime && (
            <div className="flex items-center">
              <Activity className="w-3 h-3 mr-2 text-blue-500 flex-shrink-0" />
              <span>{t('busResults.expectedTime')} {bus.expectedTime}</span>
            </div>
          )}
          {bus.destinationTime && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2 text-orange-500 flex-shrink-0" />
              <span>{t('busResults.endTime')} {bus.destinationTime}</span>
            </div>
          )}
        </div>

        {/* Driver Information */}
        <div className="space-y-1">
          {driverName && (
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span className="text-sm">{driverName}</span>
            </div>
          )}
          {driverPhone && driverPhone !== 'Contact Support' && driverPhone !== '+91-9876543210' && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span className="text-sm">{driverPhone}</span>
            </div>
          )}
        </div>

        {/* Current Location */}
        {(bus.location || currentLocation) && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-sm">
              {currentLocation || 'Live location available'}
            </span>
          </div>
        )}

        {/* Route Match Details for Route Search */}
        {searchType === 'route' && (bus.routeMatch || bus.routeAnalysis) && (
          <div className="border-t pt-3 mt-3">
            <div className="text-xs text-gray-600 space-y-1">
              {(bus.routeMatch || bus.routeAnalysis).fromDistance < Infinity && (
                <div className="flex justify-between">
                  <span>{t('busResults.distanceFromStart')}</span>
                  <span className="font-medium">{formatDistance((bus.routeMatch || bus.routeAnalysis).fromDistance)}</span>
                </div>
              )}
              {(bus.routeMatch || bus.routeAnalysis).toDistance < Infinity && (
                <div className="flex justify-between">
                  <span>{t('busResults.distanceToDestination')}</span>
                  <span className="font-medium">{formatDistance((bus.routeMatch || bus.routeAnalysis).toDistance)}</span>
                </div>
              )}
              {(bus.routeMatch || bus.routeAnalysis).isCorrectDirection !== undefined && (
                <div className="flex justify-between">
                  <span>{t('busResults.direction')}</span>
                  <span className={`font-medium ${(bus.routeMatch || bus.routeAnalysis).isCorrectDirection ? 'text-green-600' : 'text-orange-600'}`}>
                    {(bus.routeMatch || bus.routeAnalysis).isCorrectDirection ? t('busResults.correct') : t('busResults.opposite') }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Metadata */}
        {(bus.hasRoute !== undefined || bus.routePoints !== undefined) && (
          <div className="border-t pt-2 mt-2 text-xs text-gray-500">
            {bus.hasRoute && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {t('busResults.hasRouteData')}
              </span>
            )}
            {bus.routePoints > 0 && (
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                {bus.routePoints} {t('busResults.points')}
              </span>
            )}
          </div>
        )}

        {/* Debug: Coordinates Display */}
        {(bus.lat || bus.latitude) && (bus.lng || bus.longitude) && process.env.NODE_ENV === 'development' && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-xs">
              Lat: {(bus.lat || bus.latitude)?.toFixed(6)}, 
              Lng: {(bus.lng || bus.longitude)?.toFixed(6)}
            </span>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 border-t pt-2 mt-3">
            {t('busResults.lastUpdated')} {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

const BusSearchResults = ({ 
  searchResults, 
  isLoading = false, 
  searchType = 'location', 
  searchMetadata = null,
  onBusSelect,
  error = null 
}) => {

  const {t, i18n} = useTranslation();
    const [selectedLang, setSelectedLang] = useState(
        localStorage.getItem('selectedLanguage') || 'en'
      );
    
      const LANGUAGES = {
        en: { name: 'English', flag: '🇺🇸' },
hi: { name: 'हिन्दी', flag: '🇮🇳' },
ta: { name: 'தமிழ்', flag: '🇮🇳' },
te: { name: 'తెలుగు', flag: '🇮🇳' },
kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
ml: { name: 'മലയാളം', flag: '🇮🇳' },
bn: { name: 'বাংলা', flag: '🇮🇳' },
gu: { name: 'ગુજરાતી', flag: '🇮🇳' },
mr: { name: 'मराठी', flag: '🇮🇳' },
pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
ur: { name: 'اُردُو', flag: '🇵🇰' }, // or 🇮🇳 if preferred
kok: { name: 'कोंकणी', flag: '🇮🇳' },
or: { name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
ne: { name: 'नेपाली', flag: '🇳🇵' },
sat: { name: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳' },
sd: { name: 'سنڌي', flag: '🇵🇰' }, // or 🇮🇳 if preferred
mni: { name: 'মেইতেই লোন', flag: '🇮🇳' },
ks: { name: 'كٲشُر', flag: '🇮🇳' },
as: { name: 'অসমীয়া', flag: '🇮🇳' },

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
  // console.log("BusSearchResults - Error:", error);
  // console.log("BusSearchResults - Results:", searchResults);
  // console.log("BusSearchResults - Loading:", isLoading);
  // console.log("BusSearchResults - Results type:", typeof searchResults, Array.isArray(searchResults));
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-gray-600">
          {searchType === 'route' ? 'Analyzing routes...' : 'Searching for buses...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">{t('busResults.searchError')}</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {t('busResults.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Ensure searchResults is always an array
  const resultsArray = Array.isArray(searchResults) ? searchResults : (searchResults ? [searchResults] : []);
  
  if (resultsArray.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">{t('busResults.noBusesFound')}</h3>
        <p className="text-gray-500 mb-4">
          {searchType === 'route' 
            ? t('busResults.noBusesRoute')
            : searchType === 'busId'
            ? t('busResults.noBusesBusId')
            : t('busResults.noBusesLocation')
          }
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {t('busResults.refreshSearch')}
          </button>
        </div>
        
        {searchType === 'route' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
            <h4 className="font-medium text-blue-800 mb-2">{t('busResults.searchTips.title')}</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('busResults.searchTips.tip1')}</li>
              <li>• {t('busResults.searchTips.tip2')}</li>
              <li>• {t('busResults.searchTips.tip3')}</li>
              <li>• {t('busResults.searchTips.tip4')}</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Categorize buses for route search
  let categorizedBuses = resultsArray;
  if (searchType === 'route') {
    const passingThrough = resultsArray.filter(bus => 
      (bus.routeMatch || bus.routeAnalysis)?.passesThrough
    );
    const correctDirection = resultsArray.filter(bus => 
      (bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection && 
      !(bus.routeMatch || bus.routeAnalysis)?.passesThrough
    );
    const nearby = resultsArray.filter(bus => 
      !(bus.routeMatch || bus.routeAnalysis)?.passesThrough && 
      !(bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection
    );
    
    categorizedBuses = [...passingThrough, ...correctDirection, ...nearby];
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-green-100">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-lg font-semibold text-gray-800">
            {resultsArray.length} {resultsArray.length === 1 ? '' : 'es'} {t('busResults.busesFound')}
          </span>
          {searchType === 'route' && (
            <span className="text-sm text-gray-500 ml-2">
              {t('busResults.alongRoute')}
            </span>
          )}
        </div>
        {searchMetadata && (
          <div className="text-sm text-gray-500 text-right">
            {searchMetadata.radius && (
              <div>Within {(searchMetadata.radius/1000).toFixed(1)}km radius</div>
            )}
            {searchMetadata.totalScanned && (
              <div className="text-xs">Analyzed {searchMetadata.totalScanned} buses</div>
            )}
          </div>
        )}
      </div>

      {/* Route Search Categories */}
      {searchType === 'route' && (
        <div className="grid gap-2 text-sm">
          {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.passesThrough).length > 0 && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>
                {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.passesThrough).length} {t('busResults.routeMatch.passesThrough')}
              </span>
            </div>
          )}
          {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection && !(bus.routeMatch || bus.routeAnalysis)?.passesThrough).length > 0 && (
            <div className="flex items-center text-blue-600">
              <ArrowRight className="w-4 h-4 mr-2" />
              <span>
                {resultsArray.filter(bus => (bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection && !(bus.routeMatch || bus.routeAnalysis)?.passesThrough).length} {t('busResults.routeMatch.goodDirection')}
              </span>
            </div>
          )}
          {resultsArray.filter(bus => !(bus.routeMatch || bus.routeAnalysis)?.passesThrough && !(bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection).length > 0 && (
            <div className="flex items-center text-orange-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>
                {resultsArray.filter(bus => !(bus.routeMatch || bus.routeAnalysis)?.passesThrough && !(bus.routeMatch || bus.routeAnalysis)?.isCorrectDirection).length} {t('busResults.routeMatch.nearby')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorizedBuses.map((bus, index) => (
          <BusCard
            key={bus.deviceID || bus.deviceId || bus.id || index}
            bus={bus}
            onBusSelect={onBusSelect}
            searchType={searchType}
            searchMetadata={searchMetadata}
          />
        ))}
      </div>

      {/* Search Metadata Footer */}
      {searchMetadata && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {searchMetadata.searchLocation && (
              <div>
                <span className="font-medium">Search Center:</span>
                <div className="text-xs">
                  {searchMetadata.searchLocation.latitude?.toFixed(4)}, {searchMetadata.searchLocation.longitude?.toFixed(4)}
                </div>
              </div>
            )}
            {searchMetadata.fromLocation && searchMetadata.toLocation && (
              <div className="md:col-span-2">
                <span className="font-medium">Route:</span>
                <div className="text-xs">
                  From: {searchMetadata.fromLocation.lat?.toFixed(4)}, {searchMetadata.fromLocation.lng?.toFixed(4)}
                </div>
                <div className="text-xs">
                  To: {searchMetadata.toLocation.lat?.toFixed(4)}, {searchMetadata.toLocation.lng?.toFixed(4)}
                </div>
              </div>
            )}
            {searchMetadata.searchTime && (
              <div>
                <span className="font-medium">Search Time:</span>
                <div className="text-xs">{new Date(searchMetadata.searchTime).toLocaleTimeString()}</div>
              </div>
            )}
          </div>
          
          {searchType === 'route' && searchMetadata.fromBusesCount !== undefined && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
              Search Stats: {searchMetadata.fromBusesCount} near start, {searchMetadata.toBusesCount} near destination, {searchMetadata.routeBusesCount} relevant
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusSearchResults;