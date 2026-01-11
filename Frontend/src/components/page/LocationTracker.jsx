 feature/exponential-backoff-gps-sync
import { useEffect, useRef } from "react";

// components/LocationTracker.jsx
import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import axios from "axios";

const INITIAL_DELAY = 2000;   // 2 seconds
const MAX_DELAY = 60000;      // 60 seconds
const BACKOFF_MULTIPLIER = 2;

const LocationTracker = () => {
  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);

 feature/exponential-backoff-gps-sync
  const retryDelayRef = useRef(INITIAL_DELAY);
  const timeoutRef = useRef(null);

  const syncLocationWithBackoff = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    if (activeBusIDs.length === 0) return;
    if (!navigator.onLine) return;

 feature/exponential-backoff-gps-sync
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

    const fetchLocationAndUpdate = () => {
      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;


        try {
          await Promise.all(
            activeBusIDs.map((busId) =>
              axios.put(`${import.meta.env.VITE_BASE_URL}/update/location`, {
                deviceID: busId,
                latitude,
                longitude,
              })
 feature/exponential-backoff-gps-sync
            )
          );

          // ✅ Reset delay on success
          retryDelayRef.current = INITIAL_DELAY;
        } catch (err) {
          console.error("Failed to sync GPS location:", err);

          // ❌ Increase delay on failure
          retryDelayRef.current = Math.min(
            retryDelayRef.current * BACKOFF_MULTIPLIER,
            MAX_DELAY
          );
        }

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


        timeoutRef.current = setTimeout(
          syncLocationWithBackoff,
          retryDelayRef.current
        );
      },
      (err) => {
        console.error("Geolocation error:", err);

        retryDelayRef.current = Math.min(
          retryDelayRef.current * BACKOFF_MULTIPLIER,
          MAX_DELAY
        );

        timeoutRef.current = setTimeout(
          syncLocationWithBackoff,
          retryDelayRef.current
        );
      }
    );
  };

  useEffect(() => {
    if (activeBusIDs.length === 0) return;

    syncLocationWithBackoff();

    const handleOnline = () => {
      retryDelayRef.current = INITIAL_DELAY;
      syncLocationWithBackoff();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("online", handleOnline);
    };
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