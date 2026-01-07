// components/LocationTracker.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const LocationTracker = () => {
  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);

  useEffect(() => {
    if (activeBusIDs.length === 0) return;

    const intervalId = setInterval(() => {
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
              });
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeBusIDs]);

  return null;
};

export default LocationTracker;
