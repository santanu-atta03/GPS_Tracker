// components/LocationTracker.jsx
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const LocationTracker = () => {
  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // If no active buses, stop tracking
    if (activeBusIDs.length === 0) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log("[GPS] Tracking stopped (no active buses)");
      }
      return;
    }

    if (!("geolocation" in navigator)) {
      console.error("[GPS] Geolocation not supported by browser");
      return;
    }

    console.log("[GPS] Tracking started");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log(
          `[GPS] Position update → lat:${latitude}, lng:${longitude}, acc:${accuracy}m`
        );

        activeBusIDs.forEach((busId) => {
          axios
            .put(`${import.meta.env.VITE_BASE_URL}/update/location`, {
              deviceID: busId,
              latitude,
              longitude,
            })
            .catch((err) => {
              console.error(
                `[GPS] Failed to send location for bus ${busId}`,
                err
              );
            });
        });
      },
      (error) => {
        console.error("[GPS] Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000, // allow cached position up to 2s
        timeout: 10000,   // fail fast if GPS is unavailable
      }
    );

    // Cleanup on unmount or dependency change
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        console.log("[GPS] Tracking cleaned up");
      }
    };
  }, [activeBusIDs]);

  return null;
};

export default LocationTracker;
