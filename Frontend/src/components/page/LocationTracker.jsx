// components/LocationTracker.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const LocationTracker = () => {
  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeBusIDs.length === 0) return;

    const fetchLocationAndUpdate = () => {
      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          activeBusIDs.forEach((busId) => {
            axios
              .put(`${import.meta.env.VITE_BASE_URL}/update/location`, {
                deviceID: busId,
                latitude,
                longitude,
              })
              .catch((err) => {
                console.error(`Failed to send location for ${busId}`, err);
                setError("Failed to update location.");
              });
          });

          setIsLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to fetch GPS location.");
          setIsLoading(false);
        }
      );
    };

    // Initial fetch
    fetchLocationAndUpdate();

    // Repeat every 5 seconds
    const intervalId = setInterval(fetchLocationAndUpdate, 5000);

    return () => clearInterval(intervalId);
  }, [activeBusIDs]);

  // UI feedback (minimal, global-safe)
  return (
    <>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 14px",
            background: "#000",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "14px",
            zIndex: 9999,
          }}
        >
          Fetching location…
        </div>
      )}

      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "60px",
            right: "20px",
            padding: "10px 14px",
            background: "#c0392b",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "14px",
            zIndex: 9999,
          }}
        >
          {error}
        </div>
      )}
    </>
  );
};

export default LocationTracker;
