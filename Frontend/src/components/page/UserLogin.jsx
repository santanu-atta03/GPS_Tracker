import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";

const UserLogin = () => {
    useEffect(() => {
    // Inject styles
    const style = document.createElement("style");
    style.innerHTML = `
      .circle-container {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
      }

      .circle {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 255, 120, 0.8);
        box-shadow: 0 0 12px rgba(0, 255, 120, 0.6);
        transform-origin: center;
      }
    `;
    document.head.appendChild(style);

    // Create container
    const container = document.createElement("div");
    container.className = "circle-container";
    document.body.appendChild(container);

    // Create circles
    const circleCount = 30;
    const circles = [];

    for (let i = 0; i < circleCount; i++) {
      const circle = document.createElement("div");
      circle.className = "circle";
      circle.x = 0;
      circle.y = 0;
      container.appendChild(circle);
      circles.push(circle);
    }

    const coords = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      coords.x = e.clientX;
      coords.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animateCircles = () => {
      let x = coords.x;
      let y = coords.y;

      circles.forEach((circle, index) => {
        circle.style.left = `${x - 12}px`;
        circle.style.top = `${y - 12}px`;
        circle.style.transform = `scale(${(circles.length - index) / circles.length})`;

        const nextCircle = circles[index + 1] || circles[0];
        circle.x = x;
        circle.y = y;

        x += (nextCircle.x - x) * 0.3;
        y += (nextCircle.y - y) * 0.3;
      });

      requestAnimationFrame(animateCircles);
    };

    animateCircles();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.head.removeChild(style);
      container.remove();
    };
  }, []);

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

  // STEP 1: Submit name + send OTP
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

      // save / create user
      await axios.post(
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

  // STEP 2: Verify OTP
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
        dispatch(
          setuser({
            fullname,
            email: user.email,
            picture: user.picture,
          })
        );
        toast.success("Login successful");
        navigate("/");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid or expired OTP";
      toast.error(errorMessage);
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
