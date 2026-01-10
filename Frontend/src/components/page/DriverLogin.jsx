import React from "react";
import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useApiCall } from "../../hooks/useApiCall";
import { LoadingButton } from "../ui/loading-button";
import { Loader2 } from "lucide-react";

const DriverLogin = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();
  const [driverExp, setdriverExp] = useState("");
  const [licenceId, setlicenceId] = useState("");
  const dispatch = useDispatch();

  // API hook to verify if driver already exists
  const { loading: checkingDriver, execute: checkDriver } = useApiCall({
    apiFunction: (email) => 
      axios.get(`${import.meta.env.VITE_BASE_URL}/driver/veryfi/email/${email}`),
    showSuccessToast: false,
    showErrorToast: false,
    onSuccess: (data) => {
      if (data.success) {
        navigate("/"); // already registered driver
      }
    },
    onError: (error) => {
      // Silent error - driver doesn't exist yet, which is expected
      console.log("Driver verification:", error.response?.data || error.message);
    }
  });

  // API hook to create new driver
  const { loading: creatingDriver, execute: createDriver } = useApiCall({
    apiFunction: async ({ licenceId, driverExp }) => {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      return axios.post(
        `${import.meta.env.VITE_BASE_URL}/driver/createUser`,
        {
          fullname: user.name,
          email: user.email,
          picture: user.picture,
          licenceId,
          driverExp,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    successMessage: (data) => data.message || "Driver profile created successfully",
    onSuccess: (data) => {
      dispatch(setuser(data.userData));
      navigate("/");
    }
  });

  // Check if user already exists
  useEffect(() => {
    if (user?.email) {
      checkDriver(user.email);
    }
  }, [user]);

  // Create new driver
  const CreateDriver = async (e) => {
    e.preventDefault();
    await createDriver({ licenceId, driverExp });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {checkingDriver ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verifying driver status...</p>
        </div>
      ) : (
        <form
          onSubmit={CreateDriver}
          className="bg-white shadow-md rounded-lg p-6 w-96"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Complete Your Driver Profile
          </h2>

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Licence ID
          </label>
          <input
            type="text"
            value={licenceId}
            onChange={(e) => setlicenceId(e.target.value)}
            required
            className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your licence ID"
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Driving Experience (years)
          </label>
          <input
            type="text"
            value={driverExp}
            onChange={(e) => setdriverExp(e.target.value)}
            required
            className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter years of experience"
          />

          <LoadingButton
            type="submit"
            loading={creatingDriver}
            loadingText="Creating Profile..."
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Submit
          </LoadingButton>
        </form>
      )}
    </div>
  );
};

export default DriverLogin;
