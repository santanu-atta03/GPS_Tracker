import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";

const Complete = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();
  const [driverExp, setdriverExp] = useState("");
  const [licenceId, setlicenceId] = useState("");
  const dispatch = useDispatch();

  // Check if user already exists
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Wait for Auth0 user to load
      try {
        const res = await axios.get(
          `https://gps-tracker-kq2q.vercel.app/api/v1/driver/veryfi/email/${user.email}`
        );
        if (res.data.success) {
          navigate("/"); // already registered driver
        }
      } catch (error) {
        console.log(
          "Verification error:",
          error.response?.data || error.message
        );
      }
    };
    fetchData();
  }, [getAccessTokenSilently, navigate, user]);

  // Create new driver
  const CreateDriver = async (e) => {
    e.preventDefault();
    console.log("call")
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      console.log(token)
      const res = await axios.post(
        "https://gps-tracker-kq2q.vercel.app/api/v1/driver/createUser",
        {
          fullname: user.name,
          email: user.email,
          picture: user.picture,
          licenceId,
          driverExp,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        dispatch(setuser(res.data.userData));
        navigate("/"); // redirect after success
      }
    } catch (error) {
      console.log("Create Driver error:", error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Complete;
