import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const INITIAL_DELAY = 2000;   // 2 seconds
const MAX_DELAY = 60000;      // 60 seconds
const BACKOFF_MULTIPLIER = 2;

const LocationTracker = () => {
  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);

  const retryDelayRef = useRef(INITIAL_DELAY);
  const timeoutRef = useRef(null);

  const syncLocationWithBackoff = () => {
    if (activeBusIDs.length === 0) return;
    if (!navigator.onLine) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          await Promise.all(
            activeBusIDs.map((busId) =>
              axios.put(`${import.meta.env.VITE_BASE_URL}/update/location`, {
                deviceID: busId,
                latitude,
                longitude,
              })
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

  return null;
};

export default LocationTracker;
