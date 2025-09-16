import toast from "react-hot-toast"
import { apiConnector } from "../apiConnector";
import { busEndpoints } from "../apis";


const {
    BUS_DETAILS_API
} = busEndpoints


export const getBusLocationByDeviceId = async (busId) => {
  const toastId = toast.loading("Fetching bus location...");
  let result = null;

  try {
    const response = await apiConnector("GET", BUS_DETAILS_API, {busId});

    if (!response?.data?.success) {
      throw new Error("Could not fetch bus location");
    }
    console.log("Printing res : ",response)
    result = response.data.latestLocations; 
  } catch (error) {
    console.log("GET BUS LOCATION ERROR:", error);
    toast.error(error.message || "Something went wrong");
  }

  toast.dismiss(toastId);
  return result;
};
