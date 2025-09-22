// // components/page/BusDetailsPage.jsx
// import { useRef, useState, useEffect } from "react";
// import React from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import MapComponent from "../map/MapComponent";
// import {
//   ChevronLeft,
//   Clock,
//   User,
//   MapPin,
//   AlertCircle,
//   Loader2,
// } from "lucide-react";
// import { getBusLocationByDeviceId } from "../../services/operations/busAPI";
// import Navbar from "../shared/Navbar";
// import { useTranslation } from "react-i18next";

// const BusDetailsPage = () => {
//   const [busDetails, setBusDetails] = useState(null);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const previousLocationRef = useRef(null);
//   const { deviceID } = useParams();
//   const navigate = useNavigate();

//   console.log("Device id:", deviceID);

//   useEffect(() => {
//     if (!deviceID) {
//       setError("No bus ID provided");
//       setIsLoading(false);
//       return;
//     }

//     const fetchBusDetails = async () => {
//       try {
//         console.log("Fetching bus details for:", deviceID);
//         const response = await getBusLocationByDeviceId(deviceID);
//         console.log("Bus details response:", response);

//         if (!response) {
//           setError(`Bus with ID "${deviceID}" not found`);
//           setIsLoading(false);
//           return;
//         }

//         // Handle the transformed data structure
//         const newLocation = response.location?.coordinates;

//         // Compare previous location with new location (both arrays)
//         const prev = previousLocationRef.current;

//         const locationChanged =
//           !prev ||
//           !newLocation ||
//           prev[0] !== newLocation[0] ||
//           prev[1] !== newLocation[1];

//         if (locationChanged && newLocation) {
//           previousLocationRef.current = newLocation;
//           setBusDetails(response);
//         } else if (!busDetails) {
//           // First time loading
//           setBusDetails(response);
//         }

//         setIsLoading(false);
//         setError(null);
//       } catch (err) {
//         console.error("Could not fetch bus details", err);
//         setError("Failed to fetch bus details. Please try again.");
//         setIsLoading(false);
//       }
//     };

//     // Initial fetch immediately
//     fetchBusDetails();

//     // Poll every 10 seconds (10000 ms)
//     const intervalId = setInterval(fetchBusDetails, 10000);

//     // Cleanup interval on unmount or deviceID change
//     return () => clearInterval(intervalId);
//   }, [deviceID]);

//   // Update current time every second
//   useEffect(() => {
//     const timeInterval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timeInterval);
//   }, []);

//   const { t, i18n } = useTranslation();
//   const [selectedLang, setSelectedLang] = useState(
//     localStorage.getItem("selectedLanguage") || "en"
//   );

//   const LANGUAGES = {
//     en: { name: "English", flag: "🇺🇸" },
//     hi: { name: "हिंदी", flag: "🇮🇳" },
//     ta: { name: "தமிழ்", flag: "🇮🇳" },
//     te: { name: "తెలుగు", flag: "🇮🇳" },
//     kn: { name: "ಕನ್ನಡ", flag: "🇮🇳" },
//     ml: { name: "മലയാളം", flag: "🇮🇳" },
//     bn: { name: "বাংলা", flag: "🇧🇩" },
//     gu: { name: "ગુજરાતી", flag: "🇮🇳" },
//     mr: { name: "मराठी", flag: "🇮🇳" },
//     pa: { name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
//     ur: { name: "اردو", flag: "🇵🇰" },
//   };

//   // Handle language change with i18next
//   const handleLanguageChange = (langCode) => {
//     if (!langCode) return;

//     const currentLang = localStorage.getItem("selectedLanguage");
//     if (currentLang === langCode) return;

//     setSelectedLang(langCode);
//     localStorage.setItem("selectedLanguage", langCode);

//     // Change language using i18next
//     i18n.changeLanguage(langCode);
//   };

//   // Initialize language on component mount
//   useEffect(() => {
//     const savedLang = localStorage.getItem("selectedLanguage");
//     if (savedLang && savedLang !== i18n.language) {
//       i18n.changeLanguage(savedLang);
//       setSelectedLang(savedLang);
//     }
//   }, [i18n]);

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
//           <p className="text-lg text-gray-600">{t('busDetails.loadingBusDetails')}</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
//         {/* Header */}
//         <header className="bg-white shadow-lg border-b border-green-100">
//           <div className="max-w-7xl mx-auto px-4 py-4">
//             <div className="flex items-center">
//               <button
//                 onClick={() => navigate("/")}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <ChevronLeft className="w-6 h-6 text-gray-600" />
//               </button>
//               <h1 className="text-2xl font-bold text-gray-800 ml-4">
//                 {t('busDetails.title')}
//               </h1>
//             </div>
//           </div>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 py-8">
//           <div className="text-center py-12">
//             <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-gray-600 mb-2">
//               {t('busDetails.errorLoading')}
//             </h3>
//             <p className="text-gray-500 mb-4">{error}</p>
//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={() => navigate("/")}
//                 className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//               >
//                 {t('busDetails.goBack')}
//               </button>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//               >
//                 {t('busDetails.tryAgain')}
//               </button>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // No bus data
//   if (!busDetails) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
//         <header className="bg-white shadow-lg border-b border-green-100">
//           <div className="max-w-7xl mx-auto px-4 py-4">
//             <div className="flex items-center">
//               <button
//                 onClick={() => navigate("/")}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <ChevronLeft className="w-6 h-6 text-gray-600" />
//               </button>
//               <h1 className="text-2xl font-bold text-gray-800 ml-4">
//                 {t('busDetails.busNotFound')}
//               </h1>
//             </div>
//           </div>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 py-8">
//           <div className="text-center py-12">
//             <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-gray-600 mb-2">
//               {t('busDetails.busNotFound')}
//             </h3>
//             <p className="text-gray-500 mb-4">
//               {t('busDetails.noBusWithId')} {deviceID}
//             </p>
//             <button
//               onClick={() => navigate("/")}
//               className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//             >
//               {t('busDetails.searchForBuses')}
//             </button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Helper function to get status color
//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "active":
//       case "on route":
//         return "bg-green-100 text-green-800";
//       case "at stop":
//       case "stopped":
//         return "bg-blue-100 text-blue-800";
//       case "delayed":
//         return "bg-yellow-100 text-yellow-800";
//       case "offline":
//       case "inactive":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
//         {/* Header */}
//         <header className="bg-white shadow-lg border-b border-green-100">
//           <div className="max-w-7xl mx-auto px-4 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={() => navigate("/")}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <ChevronLeft className="w-6 h-6 text-gray-600" />
//                 </button>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800">
//                     {busDetails.name || busDetails.busName}
//                   </h1>
//                   <p className="text-gray-600">{busDetails.deviceID}</p>
//                 </div>
//               </div>
//               <div
//                 className={`px-4 py-2 rounded-full ${getStatusColor(
//                   busDetails.status
//                 )}`}
//               >
//                 <div className="flex items-center space-x-2">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       busDetails.status === "Active" ||
//                       busDetails.status === "On Route"
//                         ? "bg-green-500"
//                         : "bg-yellow-500"
//                     } animate-pulse`}
//                   ></div>
//                   <span className="font-medium">{busDetails.status}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 py-8">
//           <div className="grid lg:grid-cols-3 gap-8">
//             {/* Left Column - Bus Info */}
//             <div className="lg:col-span-1 space-y-6">
//               {/* Time Information */}
//               <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">
//                  {t('busDetails.scheduleInfo')}
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                     <span className="text-gray-600">{t('busDetails.startTime')}</span>
//                     <span className="font-semibold text-gray-800">
//                       {busDetails.startTime}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
//                     <span className="text-gray-600">{t('busDetails.expectedArrival')}</span>
//                     <span className="font-semibold text-green-600">
//                       {busDetails.expectedTime}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                     <span className="text-gray-600">{t('busDetails.destinationTime')}</span>
//                     <span className="font-semibold text-gray-800">
//                       {busDetails.destinationTime}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
//                     <span className="text-gray-600">{t('busDetails.currentTime')}</span>
//                     <span className="font-semibold text-blue-600">
//                       {currentTime.toLocaleTimeString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Driver Information */}
//               <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">
//                   {t('busDetails.driverDetails')}
//                 </h3>
//                 <div className="flex items-center space-x-4 mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                     <User className="w-8 h-8 text-white" />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-800">
//                       {busDetails.driverName}
//                     </h4>
//                     <p className="text-gray-600 text-sm">{t('busDetails.licensedDriver')}</p>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex items-center text-gray-600">
//                     <span className="text-sm font-medium">
//                       {t('busDetails.phone')} {busDetails.driverPhone}
//                     </span>
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <span className="text-sm">{t('busDetails.experience')}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Route Information */}
//               <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">
//                   {t('busDetails.routeInfo')}
//                 </h3>
//                 <div className="space-y-3">
//                   {busDetails.route && busDetails.route.length > 0 ? (
//                     busDetails.route.slice(0, 5).map((stop, index) => (
//                       <div key={index} className="flex items-center space-x-3">
//                         <div
//                           className={`w-4 h-4 rounded-full ${
//                             index === 0
//                               ? "bg-green-500"
//                               : index === busDetails.route.length - 1
//                               ? "bg-red-500"
//                               : "bg-blue-500"
//                           }`}
//                         ></div>
//                         <span className="text-gray-700">
//                           {stop.name || `${t('busDetails.stats.stops')} ${index + 1}`}
//                         </span>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-gray-500 text-sm">
//                       {t('busDetails.routeNotAvailable')}
//                     </div>
//                   )}
//                   {busDetails.route && busDetails.route.length > 5 && (
//                     <div className="text-gray-500 text-sm">
//                       +{busDetails.route.length - 5} {t('busDetails.moreStops')}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Last Updated Info */}
//               <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">{t('busDetails.status')}</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">{t('busDetails.lastUpdated')}</span>
//                     <span className="text-sm text-gray-800">
//                       {busDetails.lastUpdated
//                         ? new Date(busDetails.lastUpdated).toLocaleString()
//                         : t('busDetails.unknown')}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">{t('busDetails.location')}</span>
//                     <span className="text-sm text-gray-800">
//                       {busDetails.location?.coordinates
//                         ? `${busDetails.location.coordinates[1].toFixed(
//                             4
//                           )}, ${busDetails.location.coordinates[0].toFixed(4)}`
//                         : t('busDetails.unknown')}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Map */}
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-lg font-bold text-gray-800">
//                     {t('busDetails.liveRouteTracking')}
//                   </h3>
//                   <div className="flex items-center space-x-2 bg-green-50 rounded-full px-3 py-1">
//                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                     <span className="text-sm font-medium text-green-700">
//                       {t('busDetails.live')}
//                     </span>
//                   </div>
//                 </div>

//                 {busDetails.location?.coordinates ? (
//                   <MapComponent
//                     routeCoords={busDetails.route || []}
//                     currentLocation={busDetails.location.coordinates}
//                     busId={busDetails.deviceID}
//                   />
//                 ) : (
//                   <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
//                     <div className="text-center">
//                       <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                       <p className="text-gray-600">
//                         {t('busDetails.locationNotAvailable')}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Additional Stats */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//                   <div className="text-center p-3 bg-gray-50 rounded-lg">
//                     <div className="text-2xl font-bold text-gray-800">--</div>
//                     <div className="text-sm text-gray-600">{t('busDetails.stats.kmh')}</div>
//                     <div className="text-xs text-gray-500">{t('busDetails.stats.speed')}</div>
//                   </div>
//                   <div className="text-center p-3 bg-green-50 rounded-lg">
//                     <div className="text-2xl font-bold text-green-600">--</div>
//                     <div className="text-sm text-gray-600">{t('busDetails.stats.min')}</div>
//                     <div className="text-xs text-gray-500">{t('busDetails.stats.eta')}</div>
//                   </div>
//                   <div className="text-center p-3 bg-blue-50 rounded-lg">
//                     <div className="text-2xl font-bold text-blue-600">--</div>
//                     <div className="text-sm text-gray-600">{t('busDetails.stats.km')}</div>
//                     <div className="text-xs text-gray-500">{t('busDetails.stats.distance')}</div>
//                   </div>
//                   <div className="text-center p-3 bg-yellow-50 rounded-lg">
//                     <div className="text-2xl font-bold text-yellow-600">--</div>
//                     <div className="text-sm text-gray-600">{t('busDetails.stats.stops')}</div>
//                     <div className="text-xs text-gray-500">{t('busDetails.stats.remaining')}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// };

// export default BusDetailsPage;



// components/page/BusDetailsPage.jsx
import { useRef, useState, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapComponent from "../map/MapComponent";
import {
  ChevronLeft,
  Clock,
  User,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getBusLocationByDeviceId } from "../../services/operations/busAPI";
import Navbar from "../shared/Navbar";
import { useTranslation } from "react-i18next";

// Utility function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Calculate speed based on route history
const calculateSpeed = (route) => {
  if (!route || route.length < 2) return 0;
  console.log("Route in home page : ",route)
  // Get last 3-5 points to calculate average speed (fewer points for more stable calculation)
  const recentPoints = route.slice(-Math.min(5, route.length));
  let totalDistance = 0;
  let totalTime = 0;
  let validCalculations = 0;
  
  for (let i = 1; i < recentPoints.length; i++) {
    const prev = recentPoints[i - 1];
    const curr = recentPoints[i];
    
    if (prev.coordinates && curr.coordinates && prev.timestamp && curr.timestamp) {
      const distance = calculateDistance(
        prev.coordinates[0], prev.coordinates[1],
        curr.coordinates[0], curr.coordinates[1]
      );
      
      const timeDiff = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000; // seconds
      
      // Only include if there's reasonable movement and time difference
      if (timeDiff > 10 && timeDiff < 3600 && distance > 5 && distance < 50000) { // 10s-1hr, 5m-50km limits
        totalDistance += distance;
        totalTime += timeDiff;
        validCalculations++;
      }
    }
  }
  
  if (totalTime === 0 || validCalculations === 0) return 0;
  
  // Speed in km/h with reasonable limits
  const speedMs = totalDistance / totalTime;
  const speedKmh = speedMs * 3.6; // Convert m/s to km/h
  
  // Cap speed at realistic values (max 120 km/h for buses)
  return Math.min(Math.max(Math.round(speedKmh), 0), 120);
};

// Calculate ETA based on current speed and remaining distance
const calculateETA = (currentLocation, route, destinationTime, currentSpeed) => {
  if (!currentLocation || !route || route.length === 0) {
    return "Calculating...";
  }
  
  // If we have a destination coordinate in route, calculate distance to it
  const lastRoutePoint = route[route.length - 1];
  if (!lastRoutePoint || !lastRoutePoint.coordinates) {
    return "Calculating...";
  }
  
  const remainingDistance = calculateDistance(
    currentLocation[0], currentLocation[1],
    lastRoutePoint.coordinates[0], lastRoutePoint.coordinates[1]
  );
  
  // Use current speed or reasonable default speed
  let effectiveSpeed = currentSpeed;
  if (currentSpeed === 0 || currentSpeed < 5) {
    effectiveSpeed = 25; // Default 25 km/h for urban areas when stopped or very slow
  }
  
  if (remainingDistance < 100) { // Less than 100 meters
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + 2 * 60000); // Add 2 minutes
    return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const etaHours = (remainingDistance / 1000) / effectiveSpeed; // hours
  const etaMilliseconds = etaHours * 60 * 60 * 1000; // convert to milliseconds
  
  const currentTime = new Date();
  const arrivalTime = new Date(currentTime.getTime() + etaMilliseconds);
  
  // Return formatted time (HH:MM)
  return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Calculate remaining stops (simplified - count route points ahead)
const calculateRemainingStops = (currentLocation, route) => {
  if (!currentLocation || !route || route.length === 0) return 0;
  
  // Find closest point in route to current location
  let closestIndex = 0;
  let minDistance = Infinity;
  
  route.forEach((point, index) => {
    if (point.coordinates) {
      const distance = calculateDistance(
        currentLocation[0], currentLocation[1],
        point.coordinates[0], point.coordinates[1]
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    }
  });
  
  // Return remaining points in route as approximate stops
  return Math.max(0, route.length - closestIndex - 1);
};

// Format start time based on route data
const getActualStartTime = (route, startTime) => {
  if (!route || route.length === 0) return startTime || "06:00 AM";
  
  // Get first route point timestamp
  const firstPoint = route.find(point => point.timestamp);
  if (firstPoint && firstPoint.timestamp) {
    return new Date(firstPoint.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  return startTime || "06:00 AM";
};

const BusDetailsPage = () => {
  const [busDetails, setBusDetails] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    speed: 0,
    eta: "Calculating...",
    remainingDistance: 0,
    remainingStops: 0
  });
  
  const previousLocationRef = useRef(null);
  const { deviceID } = useParams();
  const navigate = useNavigate();

 

  // Calculate real-time statistics
  const calculateRealTimeStats = (busData) => {
    if (!busData) return;
    console.log("Bus data in home page : ",busData)
    const currentLocation = busData.location?.location?.coordinates;
    const route = busData.route || [];
    
    const currentSpeed = calculateSpeed(route);
    const eta = calculateETA(currentLocation, route, busData.destinationTime, currentSpeed);
    const remainingStops = calculateRemainingStops(currentLocation, route);
    
    // Calculate remaining distance to last route point
    let remainingDistance = 0;
    if (currentLocation && route.length > 0) {
      const lastPoint = route[route.length - 1];
      if (lastPoint?.coordinates) {
        remainingDistance = Math.round(calculateDistance(
          currentLocation[0], currentLocation[1],
          lastPoint.coordinates[0], lastPoint.coordinates[1]
        ) / 1000); // Convert to km
      }
    }
    
    setRealTimeStats({
      speed: currentSpeed,
      eta,
      remainingDistance,
      remainingStops
    });
  };

  useEffect(() => {
    if (!deviceID) {
      setError("No bus ID provided");
      setIsLoading(false);
      return;
    }

    const fetchBusDetails = async () => {
      try {
      
        const response = await getBusLocationByDeviceId(deviceID);
        console.log("Bus details response:", response);
        // console.log("ayan bus route" , busDetails.location.route)
        if (!response) {
          setError(`Bus with ID "${deviceID}" not found`);
          setIsLoading(false);
          return;
        }

        // Handle the transformed data structure
        const newLocation = response.location?.location?.coordinates;

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
          calculateRealTimeStats(response);
        } else if (!busDetails) {
          // First time loading
          setBusDetails(response);
          calculateRealTimeStats(response);
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

  // Recalculate stats when bus details change
  useEffect(() => {
    if (busDetails) {
      calculateRealTimeStats(busDetails);
    }
  }, [busDetails]);

  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem("selectedLanguage") || "en"
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

    const currentLang = localStorage.getItem("selectedLanguage");
    if (currentLang === langCode) return;

    setSelectedLang(langCode);
    localStorage.setItem("selectedLanguage", langCode);

    // Change language using i18next
    i18n.changeLanguage(langCode);
  };

  // Initialize language on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setSelectedLang(savedLang);
    }
  }, [i18n]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">{t('busDetails.loadingBusDetails')}</p>
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
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 ml-4">
                {t('busDetails.title')}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {t('busDetails.errorLoading')}
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {t('busDetails.goBack')}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {t('busDetails.tryAgain')}
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
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 ml-4">
                {t('busDetails.busNotFound')}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {t('busDetails.busNotFound')}
            </h3>
            <p className="text-gray-500 mb-4">
              {t('busDetails.noBusWithId')} {deviceID}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {t('busDetails.searchForBuses')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "on route":
        return "bg-green-100 text-green-800";
      case "at stop":
      case "stopped":
        return "bg-blue-100 text-blue-800";
      case "delayed":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/")}
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
              <div
                className={`px-4 py-2 rounded-full ${getStatusColor(
                  busDetails.status
                )}`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      busDetails.status === "Active" ||
                      busDetails.status === "On Route"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    } animate-pulse`}
                  ></div>
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
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                 {t('busDetails.scheduleInfo')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{t('busDetails.startTime')}</span>
                    <span className="font-semibold text-gray-800">
                      {getActualStartTime(busDetails.route, busDetails.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-600">{t('busDetails.expectedArrival')}</span>
                    <span className="font-semibold text-green-600">
                      {realTimeStats.eta}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{t('busDetails.destinationTime')}</span>
                    <span className="font-semibold text-gray-800">
                      {busDetails.destinationTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">{t('busDetails.currentTime')}</span>
                    <span className="font-semibold text-blue-600">
                      {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {t('busDetails.driverDetails')}
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {busDetails.driverName}
                    </h4>
                    <p className="text-gray-600 text-sm">{t('busDetails.licensedDriver')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium">
                      {t('busDetails.phone')} {busDetails.driverPhone}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm">{t('busDetails.experience')}</span>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {t('busDetails.routeInfo')}
                </h3>
                <div className="space-y-3">
                  {busDetails.location.route && busDetails.location.route.length > 0 ? (
                    busDetails.route.slice(0, 5).map((stop, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            index === 0
                              ? "bg-green-500"
                              : index === busDetails.location.route.length - 1
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="text-gray-700">
                          {stop.name || `${t('busDetails.stats.stops')} ${index + 1}`}
                          {stop.timestamp && (
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(stop.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">
                      {t('busDetails.routeNotAvailable')}
                    </div>
                  )}
                  {busDetails.location.route && busDetails.location.route.length > 5 && (
                    <div className="text-gray-500 text-sm">
                      +{busDetails.location.route.length - 5} {t('busDetails.moreStops')}
                    </div>
                  )}
                </div>
              </div>

              {/* Last Updated Info */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('busDetails.status')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('busDetails.lastUpdated')}</span>
                    <span className="text-sm text-gray-800">
                      {busDetails.location.lastUpdated
                        ? new Date(busDetails.location.lastUpdated).toLocaleString()
                        : t('busDetails.unknown')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('busDetails.location')}</span>
                    <span className="text-sm text-gray-800">
                      {busDetails.location?.location.coordinates
                        ? `${busDetails.location.location.coordinates[1].toFixed(
                            4
                          )}, ${busDetails.location.location.coordinates[0].toFixed(4)}`
                        : t('busDetails.unknown')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    {t('busDetails.liveRouteTracking')}
                  </h3>
                  <div className="flex items-center space-x-2 bg-green-50 rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      {t('busDetails.live')}
                    </span>
                  </div>
                </div>

                {busDetails.location?.location.coordinates ? (
                  <MapComponent
                    routeCoords={busDetails.route || []}
                    currentLocation={busDetails.location.location.coordinates}
                    busId={busDetails.deviceID}
                  />
                ) : (
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {t('busDetails.locationNotAvailable')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Real-time Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {realTimeStats.speed}
                    </div>
                    <div className="text-sm text-gray-600">{t('busDetails.stats.kmh')}</div>
                    <div className="text-xs text-gray-500">{t('busDetails.stats.speed')}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {realTimeStats.eta === "Calculating..." ? "--" : realTimeStats.eta}
                    </div>
                    <div className="text-sm text-gray-600">{t('busDetails.stats.min')}</div>
                    <div className="text-xs text-gray-500">{t('busDetails.stats.eta')}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {realTimeStats.remainingDistance}
                    </div>
                    <div className="text-sm text-gray-600">{t('busDetails.stats.km')}</div>
                    <div className="text-xs text-gray-500">{t('busDetails.stats.distance')}</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {realTimeStats.remainingStops}
                    </div>
                    <div className="text-sm text-gray-600">{t('busDetails.stats.stops')}</div>
                    <div className="text-xs text-gray-500">{t('busDetails.stats.remaining')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default BusDetailsPage;