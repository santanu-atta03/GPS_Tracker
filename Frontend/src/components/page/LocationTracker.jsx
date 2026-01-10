// components/LocationTracker.jsx
feature/gps-live-tracking-84
import { useEffect, useRef } from "react";

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import axios from "axios";

const LocationTracker = () => {
  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);
  const watchIdRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
feature/gps-live-tracking-84
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
