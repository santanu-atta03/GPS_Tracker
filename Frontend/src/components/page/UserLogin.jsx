import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";
import { User, Mail, Shield, ArrowRight } from "lucide-react";

const UserLogin = () => {
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darktheme } = useSelector((store) => store.auth);

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

  const verifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/email/verify-otp`,
        {
          email: user.email,
          otp,
        }
      );

      if (res.data.success) {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

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

        dispatch(
          setuser({
            fullname,
            email: user.email,
            picture: user.picture,
            ...createUserRes.data.userData
          })
        );
        toast.success("Login successful");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Invalid OTP or Creation Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
      }`}
    >
      <div className="w-full max-w-md px-4">
        <div
          className={`rounded-2xl shadow-xl p-8 transition-all duration-300 ${
            darktheme
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-green-100"
          }`}
        >
          {step === "FORM" && (
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    darktheme ? "bg-green-900/50" : "bg-green-100"
                  }`}
                >
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  Welcome Back
                </h2>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Please confirm your details to continue
                </p>
              </div>

              {/* User Info Display */}
              {user?.picture && (
                <div className="flex justify-center mb-6">
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-green-500 shadow-lg"
                  />
                </div>
              )}

              {/* Email Display */}
              <div className="mb-6">
                <div
                  className={`flex items-center p-4 rounded-xl ${
                    darktheme
                      ? "bg-gray-900/50 border border-gray-700"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <Mail className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium mb-1 ${
                        darktheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Email Address
                    </p>
                    <p
                      className={`text-sm truncate ${
                        darktheme ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darktheme ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      darktheme ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors ${
                      darktheme
                        ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-green-500"
                        : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-green-500"
                    } focus:outline-none`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {loading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "OTP" && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    darktheme ? "bg-green-900/50" : "bg-green-100"
                  }`}
                >
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  Verify Email
                </h2>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  We've sent a verification code to your email
                </p>
              </div>

              {/* Email Display */}
              <div className="mb-6">
                <div
                  className={`flex items-center p-4 rounded-xl ${
                    darktheme
                      ? "bg-gray-900/50 border border-gray-700"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <Mail className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium mb-1 ${
                        darktheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      OTP sent to
                    </p>
                    <p
                      className={`text-sm font-semibold truncate ${
                        darktheme ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* OTP Input */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darktheme ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors text-center text-2xl font-semibold tracking-widest ${
                    darktheme
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-green-500"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-green-500"
                  } focus:outline-none`}
                />
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>

              {/* Resend Option */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`text-sm font-medium transition-colors ${
                    darktheme
                      ? "text-green-400 hover:text-green-300"
                      : "text-green-600 hover:text-green-700"
                  } disabled:opacity-50`}
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;