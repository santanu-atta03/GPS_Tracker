// services/operations/busAPI.js
import toast from "react-hot-toast"
import { apiConnector } from "../apiConnector";
import { busEndpoints } from "../apis";

const {
  BUS_DETAILS_API
} = busEndpoints

export const getBusLocationByDeviceId = async (deviceID) => {
  const toastId = toast.loading("Fetching bus location...");
  
  try {
    const response = await apiConnector("GET", BUS_DETAILS_API + `/${deviceID}`);
    console.log("Printing res:", response);
    
    if (!response?.data?.success) {
      throw new Error("Could not fetch bus location");
    }
    
    // Transform the API response to match expected format
    const busData = response.data.latestLocations;
    
    if (!busData) {
      throw new Error("Bus data not found in response");
    }
    
    // Transform the data to match UI expectations
    const transformedBus = {
      // Core identifiers
      deviceID: busData.deviceID,
      id: busData.deviceID,
      deviceId: busData.deviceID,
      
      // Basic info (with defaults for missing data)
      name: busData.name || `Bus ${busData.deviceID}`,
      busName: busData.busName || `Bus ${busData.deviceID}`,
      status: busData.status || 'Active',
      
      // Location data
      location: busData.location,
      currentLocation: busData.currentLocation || 'Live tracking available',
      lat: busData.location?.coordinates?.[1], // GeoJSON format is [lng, lat]
      lng: busData.location?.coordinates?.[0],
      latitude: busData.location?.coordinates?.[1],
      longitude: busData.location?.coordinates?.[0],
      
      // Route data
      route: busData.route || [],
      
      // Time data (with defaults)
      lastUpdated: busData.lastUpdated,
      timestamp: busData.lastUpdated,
      updatedAt: busData.lastUpdated,
      startTime: busData.startTime || '06:00 AM',
      expectedTime: busData.expectedTime || 'Calculating...',
      destinationTime: busData.destinationTime || '08:00 PM',
      
      // Driver data (with defaults)
      driverName: busData.driverName || 'Driver Available',
      driver: busData.driverName || 'Driver Available',
      driverPhone: busData.driverPhone || 'Contact Support',
      
      // Additional metadata
      _id: busData._id,
      __v: busData.__v
    };
    
    toast.dismiss(toastId);
    toast.success("Bus location fetched successfully");
    
    return transformedBus;
    
  } catch (error) {
    console.log("GET BUS LOCATION ERROR:", error);
    toast.error(error.message || "Something went wrong");
    toast.dismiss(toastId);
    
    // Return null for not found, throw for other errors
    if (error.message.includes("not found") || error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};