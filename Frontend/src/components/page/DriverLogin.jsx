
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";
import { CreditCard, Award, User, ArrowRight, Sparkles, Shield, Phone, Eye, EyeOff, HelpCircle, Facebook } from "lucide-react";
// Social login handler placeholders
const handleGoogleLogin = () => { window.open("/api/auth/google", "_self"); };
const handleFacebookLogin = () => { window.open("/api/auth/facebook", "_self"); };

// Support direct navigation to /api/auth/google and /api/auth/facebook on the frontend
if (window.location.pathname === "/api/auth/google") {
  handleGoogleLogin();
}
if (window.location.pathname === "/api/auth/facebook") {
  handleFacebookLogin();
}

import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const DriverLogin = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);
  const [driverExp, setDriverExp] = useState("");
  const [licenceId, setLicenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [phone, setPhone] = useState("");
  const [showLicenceId, setShowLicenceId] = useState(false);

  // Real-time validation for fields
  const validateField = (name, value) => {
    let error = "";
    if (name === "licenceId") {
      if (!value) error = "Driver License ID is required";
      else if (!/^([A-Za-z0-9\-]{5,20})$/.test(value)) error = "Enter a valid License ID (5-20 chars, letters/numbers/-)";
    }
    if (name === "driverExp") {
      if (!value) error = "Driving experience is required";
      else if (isNaN(value) || value < 0 || value > 60) error = "Enter a valid number of years (0-60)";
    }
    if (name === "phone") {
      if (!value) error = "Phone number is required";
      else if (!/^\+\d{10,15}$/.test(value)) error = "Enter a valid phone number with country code";
    }
    return error;
  };
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `https://gps-tracker-kq2q.vercel.app/api/v1/driver/veryfi/email/${user.email}`
        );
        if (res.data.success) {
          navigate("/");
        }
      } catch (error) {
        console.log("Verification error:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, [getAccessTokenSilently, navigate, user]);

  const CreateDriver = async (e) => {
    e.preventDefault();
    // Validation
    let newErrors = {};
    const licenceIdError = validateField("licenceId", licenceId);
    const driverExpError = validateField("driverExp", driverExp);
    const phoneError = validateField("phone", phone);
    if (licenceIdError) newErrors.licenceId = licenceIdError;
    if (driverExpError) newErrors.driverExp = driverExpError;
    if (phoneError) newErrors.phone = phoneError;
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/driver/createUser`,
        {
          fullname: user.name,
          email: user.email,
          picture: user.picture,
          licenceId,
          driverExp,
          phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        dispatch(setuser(res.data.userData));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      console.log("Create Driver error:", error.message);
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? 'bg-blue-500/5' : 'bg-blue-300/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? 'bg-purple-500/5' : 'bg-purple-300/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div
          className={`rounded-3xl shadow-2xl p-8 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                  darktheme 
                    ? "bg-gradient-to-br from-blue-600 to-purple-600" 
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}
              >
                <Shield className="w-10 h-10 text-white" />
              </div>
              <Sparkles className={`absolute -top-1 -right-1 w-6 h-6 ${darktheme ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
            </div>
            <h2
              className={`text-3xl font-bold mb-3 bg-gradient-to-r ${
                darktheme 
                  ? "from-blue-400 to-purple-400" 
                  : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent`}
            >
              Complete Your Driver Profile
            </h2>
            <p
              className={`text-sm ${
                darktheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Just a few more details to get you started
            </p>
          </div>

          {/* User Info Display */}
          {user && (
            <div
              className={`mb-6 p-4 rounded-2xl border ${
                darktheme
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-16 h-16 rounded-xl object-cover ring-4 ring-blue-500/30 shadow-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold text-lg mb-1 truncate ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`text-sm truncate ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={CreateDriver} autoComplete="off" className="space-y-6" aria-label="Driver Profile Form">
            {/* Phone Number Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="phone"
                  className={`block text-base font-semibold ${darktheme ? "text-gray-200" : "text-gray-800"}`}
                >
                  <Phone className="w-4 h-4 inline mr-2 align-text-bottom" />
                  Phone Number
                </label>
                <span className="ml-2 text-xs text-gray-400" title="We use your phone for verification and support.">
                  <HelpCircle className="inline w-4 h-4 mr-1" />Why needed?
                </span>
              </div>
              <div className="relative group">
                <PhoneInput
                  id="phone"
                  name="phone"
                  international
                  defaultCountry="IN"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    setErrors((prev) => ({ ...prev, phone: validateField("phone", value) }));
                  }}
                  className={`w-full pl-16 pr-4 py-4 rounded-xl border-2 transition-all outline-none ${
                    darktheme
                      ? `bg-gray-900/50 text-white placeholder-gray-500 focus:border-green-500 focus:bg-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-700'}`
                      : `bg-white text-gray-800 placeholder-gray-400 focus:border-green-500 focus:bg-white ${errors.phone ? 'border-red-500' : 'border-gray-200'}`
                  } focus:ring-4 focus:ring-green-500/20`}
                  tabIndex={1}
                  autoComplete="off"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 ml-1 animate-bounce">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 ml-1">Include country code (e.g. +91...)</p>
            </div>
            {/* Help/Forgot Links */}
            <div className="flex justify-between items-center mt-2 mb-6">
              <a href="#" className="text-xs text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded" tabIndex={0} aria-label="Forgot Driver ID?">Forgot Driver ID?</a>
              <a href="#" className="text-xs text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded" tabIndex={0} aria-label="Need Help?">Need Help?</a>
            </div>

            {/* License ID Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="licenceId"
                  className={`block text-base font-semibold ${darktheme ? "text-gray-200" : "text-gray-800"}`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2 align-text-bottom" />
                  Driver License ID
                </label>
                <span className="ml-2 text-xs text-gray-400" title="Your government-issued driver license number.">
                  <HelpCircle className="inline w-4 h-4 mr-1" />What is this?
                </span>
              </div>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                  darktheme ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <CreditCard className={`w-5 h-5 ${darktheme ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="relative">
                  <input
                    id="licenceId"
                    name="licenceId"
                    type={showLicenceId ? "text" : "password"}
                    value={licenceId}
                    onChange={(e) => {
                      setLicenceId(e.target.value);
                      setErrors((prev) => ({ ...prev, licenceId: validateField("licenceId", e.target.value) }));
                    }}
                    placeholder="Enter your driver license ID"
                    className={`w-full pl-16 pr-12 py-4 rounded-xl border-2 transition-all outline-none ${
                      darktheme
                        ? `bg-gray-900/50 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-900 ${errors.licenceId ? 'border-red-500' : 'border-gray-700'}`
                        : `bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white ${errors.licenceId ? 'border-red-500' : 'border-gray-200'}`
                    } focus:ring-4 focus:ring-blue-500/20`}
                    tabIndex={2}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showLicenceId ? "Hide License ID" : "Show License ID"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                    onClick={() => setShowLicenceId((prev) => !prev)}
                  >
                    {showLicenceId ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {errors.licenceId && (
                <p className="text-xs text-red-500 mt-1 ml-1 animate-bounce">{errors.licenceId}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 ml-1">Enter your official driver license number.</p>
            </div>

            {/* Driving Experience Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="driverExp"
                  className={`block text-base font-semibold ${darktheme ? "text-gray-200" : "text-gray-800"}`}
                >
                  <Award className="w-4 h-4 inline mr-2 align-text-bottom" />
                  Driving Experience (years)
                </label>
                <span className="ml-2 text-xs text-gray-400" title="How many years have you been driving professionally?">
                  <HelpCircle className="inline w-4 h-4 mr-1" />Why?
                </span>
              </div>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                  darktheme ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <Award className={`w-5 h-5 ${darktheme ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <input
                  id="driverExp"
                  name="driverExp"
                  type="number"
                  value={driverExp}
                  onChange={(e) => {
                    setDriverExp(e.target.value);
                    setErrors((prev) => ({ ...prev, driverExp: validateField("driverExp", e.target.value) }));
                  }}
                  min="0"
                  placeholder="Enter years of experience"
                  className={`w-full pl-16 pr-4 py-4 rounded-xl border-2 transition-all outline-none ${
                    darktheme
                      ? `bg-gray-900/50 text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-900 ${errors.driverExp ? 'border-red-500' : 'border-gray-700'}`
                      : `bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:bg-white ${errors.driverExp ? 'border-red-500' : 'border-gray-200'}`
                  } focus:ring-4 focus:ring-purple-500/20`}
                  tabIndex={3}
                  autoComplete="off"
                />
              </div>
              {errors.driverExp && (
                <p className="text-xs text-red-500 mt-1 ml-1 animate-bounce">{errors.driverExp}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 ml-1">Years of professional driving experience.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
                darktheme
                  ? "bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white"
              } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
              tabIndex={4}
              autoFocus
              aria-busy={loading}
              aria-label="Complete Driver Profile"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="animate-pulse">Creating Profile...</span>
                </>
              ) : (
                <>
                  <span className="tracking-wide uppercase">Complete Driver Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Social Login Options */}
            <div className="flex flex-col gap-2 mt-8 mb-2">
              <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Sign in with Google">
                <span className="w-5 h-5 flex items-center justify-center" aria-hidden="true">
                  {/* Google SVG icon */}
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_17_40)">
                      <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42.1H39.5C44 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
                      <path d="M24 48C30.6 48 36.1 45.9 39.5 42.1L31.8 36.4C29.9 37.6 27.3 38.4 24 38.4C17.7 38.4 12.2 34.3 10.3 28.7H2.3V34.6C5.7 41.1 14.1 48 24 48Z" fill="#34A853"/>
                      <path d="M10.3 28.7C9.8 27.5 9.5 26.2 9.5 24.8C9.5 23.4 9.8 22.1 10.3 20.9V15H2.3C0.8 18.1 0 21.4 0 24.8C0 28.2 0.8 31.5 2.3 34.6L10.3 28.7Z" fill="#FBBC05"/>
                      <path d="M24 9.6C27.7 9.6 30.7 10.9 32.7 12.7L39.7 6.1C36.1 2.7 30.6 0 24 0C14.1 0 5.7 6.9 2.3 15L10.3 20.9C12.2 15.3 17.7 9.6 24 9.6Z" fill="#EA4335"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_17_40">
                        <rect width="48" height="48" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
              </button>
              <button type="button" onClick={handleFacebookLogin} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Sign in with Facebook">
                <Facebook className="w-5 h-5 text-blue-600" /> <span className="text-sm font-medium text-gray-700">Sign in with Facebook</span>
              </button>

            </div>
          </form>

          {/* Progress Indicator & Mascot */}
          <div className={`mt-8 text-center flex flex-col items-center`}> 
            <div className={`flex items-center gap-2 mb-2`}> 
              <Shield className={`w-6 h-6 ${darktheme ? 'text-blue-400' : 'text-blue-700'}`} />
              <span className={`font-bold text-base tracking-wide ${darktheme ? 'text-blue-200' : 'text-blue-800'}`}>Driver Login</span>
            </div>
            {/* Progress Stepper */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
            </div>
            {/* Mascot/Illustration */}
            <div className="mb-2">
              <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="Driver Mascot" className="w-16 h-16 mx-auto rounded-full shadow-lg border-2 border-blue-200 bg-white" aria-hidden="true" />
            </div>
            <div className={`text-xs ${darktheme ? 'text-gray-500' : 'text-gray-500'}`}>
              🔒 Your information is secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;