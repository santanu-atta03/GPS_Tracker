import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";

const UserLogin = () => {
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // states
  const [fullname, setFullname] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("FORM"); // FORM | OTP
  const [loading, setLoading] = useState(false);

  // prefill name from Auth0
  useEffect(() => {
    if (user?.name) {
      setFullname(user.name);
    }
  }, [user]);

  // STEP 1: Send OTP Only (Do NOT create user yet)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setLoading(true);

      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      // REMOVED: User creation logic was here. 
      // We only want to send the OTP at this stage.

      // send OTP to email
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/email/send-otp`,
        { email: user.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("OTP sent to your Gmail");
      setStep("OTP");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP AND Create User
  const verifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      // 1. Verify the OTP first
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/email/verify-otp`,
        {
          email: user.email,
          otp,
        }
      );

      if (res.data.success) {
        // 2. OTP is valid, NOW create the user in the database
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        // Note: Using your existing endpoint '/user/crete/User' (mind the typo 'crete')
        const createUserRes = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/crete/User`,
          {
            fullname,
            email: user.email,
            picture: user.picture,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // 3. Update Redux and Redirect
        dispatch(
          setuser({
            fullname,
            email: user.email,
            picture: user.picture,
            ...createUserRes.data.userData // Optionally merge backend data
          })
        );
        toast.success("Login successful");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      // Determine if error was OTP or Creation related
      const msg = error.response?.data?.message || "Invalid OTP or Creation Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        {step === "FORM" && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Confirm your name
            </h2>

            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 mb-4 border rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        )}

        {step === "OTP" && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Verify Email
            </h2>

            <p className="text-sm text-gray-600 mb-2 text-center">
              OTP sent to <b>{user.email}</b>
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full p-2 mb-4 border rounded"
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLogin;