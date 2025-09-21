// services/operations/busAPI.js
import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { busEndpoints } from "../apis";

const { BUS_DETAILS_API } = busEndpoints;

export const getBusLocationByDeviceId = async (deviceID) => {
  const toastId = toast.loading("Fetching bus location...");

  try {
    const response = await apiConnector(
      "GET",
      `http://localhost:5000/api/v1/get/location/${deviceID}`
    );

    if (!response?.data?.success) {
      throw new Error("Could not fetch bus location");
    }

    toast.dismiss(toastId);
    toast.success("Bus location fetched successfully");

    return response.data.data;
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
