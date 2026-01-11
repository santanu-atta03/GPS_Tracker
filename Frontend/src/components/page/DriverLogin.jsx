import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";
import { CreditCard, Award, User, ArrowRight, Sparkles, Shield, Mail, KeyRound } from "lucide-react";
import TurnstileCaptcha from "@/components/shared/TurnstileCaptcha";

const DriverLogin = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [driverExp, setDriverExp] = useState("");
  const [licenceId, setLicenceId] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("FORM");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

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
        console.log(
          "Driver verification:",
          error.response?.data || error.message
        );
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      toast.error("Please verify CAPTCHA");
      return;
    }

    if (!licenceId.trim() || !driverExp) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

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
    if (!turnstileToken) {
      toast.error("Please verify CAPTCHA");
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

        const createDriverRes = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/driver/createUser`,
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

        if (createDriverRes.data.success) {
          dispatch(setuser(createDriverRes.data.userData));
          toast.success("Driver profile created successfully");
          navigate("/");
        }
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message || "Invalid OTP or Creation Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

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
        <div className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? 'bg-blue-500/10' : 'bg-blue-300/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? 'bg-purple-500/10' : 'bg-purple-300/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute top-1/2 left-1/2 w-64 h-64 ${darktheme ? 'bg-green-500/10' : 'bg-green-300/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div
          className={`rounded-3xl shadow-2xl p-8 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          {step === "FORM" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                      darktheme
                        ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                        : "bg-gradient-to-br from-blue-500 to-purple-500"
                    }`}
                  >
                    <Shield
                      className={`w-10 h-10 ${
                        darktheme ? "text-blue-400" : "text-white"
                      }`}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles
                      className={`w-6 h-6 ${
                        darktheme ? "text-yellow-400" : "text-yellow-500"
                      } animate-pulse`}
                    />
                  </div>
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
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

              {/* User Profile Card */}
              {user?.picture && (
                <div
                  className={`flex items-center gap-4 p-4 rounded-2xl ${
                    darktheme
                      ? "bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700"
                      : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-16 h-16 rounded-xl object-cover shadow-lg ring-2 ring-blue-500/50"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        darktheme ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {user.name || "Driver"}
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
              )}

              {/* License ID Field */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  License ID
                </label>
                <div className="relative group">
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                      darktheme ? "bg-blue-500/20" : "bg-blue-100"
                    }`}
                  >
                    <CreditCard
                      className={`w-5 h-5 ${
                        darktheme ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    value={licenceId}
                    onChange={(e) => setLicenceId(e.target.value)}
                    required
                    placeholder="Enter your license ID"
                    className={`w-full pl-16 pr-4 py-4 rounded-xl border-2 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-900"
                        : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white"
                    } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                  />
                </div>
              </div>

              {/* Driving Experience Field */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Driving Experience (years)
                </label>
                <div className="relative group">
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                      darktheme ? "bg-purple-500/20" : "bg-purple-100"
                    }`}
                  >
                    <Award
                      className={`w-5 h-5 ${
                        darktheme ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                  </div>
                  <input
                    type="number"
                    value={driverExp}
                    onChange={(e) => setDriverExp(e.target.value)}
                    required
                    min="0"
                    placeholder="Enter years of experience"
                    className={`w-full pl-16 pr-4 py-4 rounded-xl border-2 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-900"
                        : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:bg-white"
                    } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                  />
                </div>
              </div>

              {/* Turnstile CAPTCHA */}
              <div className="flex justify-center">
                <TurnstileCaptcha onVerify={setTurnstileToken} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                  darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                } hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "OTP" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                      darktheme
                        ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
                        : "bg-gradient-to-br from-green-500 to-emerald-500"
                    }`}
                  >
                    <Shield
                      className={`w-10 h-10 ${
                        darktheme ? "text-green-400" : "text-white"
                      }`}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <KeyRound
                      className={`w-6 h-6 ${
                        darktheme ? "text-yellow-400" : "text-yellow-500"
                      } animate-bounce`}
                    />
                  </div>
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                    darktheme
                      ? "from-green-400 to-emerald-400"
                      : "from-green-600 to-emerald-600"
                  } bg-clip-text text-transparent`}
                >
                  Verify Your Email
                </h2>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Enter the 6-digit code we sent to your email
                </p>
              </div>

              {/* Email Display */}
              <div
                className={`p-4 rounded-2xl ${
                  darktheme
                    ? "bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darktheme ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <Mail
                      className={`w-5 h-5 ${
                        darktheme ? "text-green-400" : "text-green-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium ${
                        darktheme ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      Code sent to
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
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength="6"
                  className={`w-full px-4 py-5 rounded-xl border-2 transition-all text-center text-3xl font-bold tracking-[0.5em] ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700 text-green-400 placeholder-gray-600 focus:border-green-500 focus:bg-gray-900"
                      : "bg-white border-gray-200 text-green-600 placeholder-gray-300 focus:border-green-500"
                  } focus:outline-none focus:ring-4 focus:ring-green-500/20`}
                />
              </div>

              {/* Turnstile CAPTCHA */}
              <div className="flex justify-center">
                <TurnstileCaptcha onVerify={setTurnstileToken} />
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyOtp}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                  darktheme
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                } hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Verify & Complete Profile</span>
                  </>
                )}
              </button>

              {/* Resend Option */}
              <div className="text-center pt-2">
                <p
                  className={`text-sm mb-2 ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Didn't receive the code?
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  disabled={loading}
                  className={`text-sm font-semibold transition-all ${
                    darktheme
                      ? "text-green-400 hover:text-green-300"
                      : "text-green-600 hover:text-green-700"
                  } disabled:opacity-50 hover:underline underline-offset-2`}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center">
          <p
            className={`text-xs ${
              darktheme ? "text-gray-500" : "text-gray-600"
            }`}
          >
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;