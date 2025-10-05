 
import haversine from "haversine-distance"; // npm install haversine-distance
import Location from "../models/Location.model.js";
import Bus from "../models/Bus.model.js";

 
export const calculateTicketPrice = async (req, res) => {
  try {
    const { busId, fromLat, fromLng, toLat, toLng } = req.body;

    if (!busId || !fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    // Step 1: Fetch Bus & its linked Location
    const bus = await Bus.findOne({deviceID : busId}).populate("location");
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    const locationData = await Location.findById(bus.location);
    if (!locationData || !locationData.route || locationData.route.length < 2) {
      return res.status(404).json({ success: false, message: "Route not found or invalid" });
    }

    const route = locationData.route;

    // Step 2: Find nearest route points for from & to
    const fromPoint = [fromLat, fromLng];
    const toPoint = [toLat, toLng];

    let fromIndex = 0, toIndex = 0;
    let minFromDist = Infinity, minToDist = Infinity;

    route.forEach((r, i) => {
      const distFrom = haversine([r.coordinates[0], r.coordinates[1]], fromPoint);
      const distTo = haversine([r.coordinates[0], r.coordinates[1]], toPoint);
      if (distFrom < minFromDist) {
        minFromDist = distFrom;
        fromIndex = i;
      }
      if (distTo < minToDist) {
        minToDist = distTo;
        toIndex = i;
      }
    });

    // Ensure correct order (swap if needed)
    if (fromIndex > toIndex) [fromIndex, toIndex] = [toIndex, fromIndex];

    // Step 3: Calculate total route distance
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += haversine(route[i].coordinates, route[i + 1].coordinates);
    }
    totalDistance /= 1000; // convert to km

    // Step 4: Calculate passenger travel distance
    let passengerDistance = 0;
    for (let i = fromIndex; i < toIndex; i++) {
      passengerDistance += haversine(route[i].coordinates, route[i + 1].coordinates);
    }
    passengerDistance /= 1000; // convert to km

    // Step 5: Calculate proportional ticket price
    const pricePerKm = bus.ticketprice / totalDistance; // ticketprice = full route price
    const ticketPrice = Math.round(passengerDistance * pricePerKm);

    return res.status(200).json({
      success: true,
      data: {
        fromIndex,
        toIndex,
        totalDistance: totalDistance.toFixed(2),
        passengerDistance: passengerDistance.toFixed(2),
        ticketPrice,
        pricePerKm: pricePerKm.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error calculating ticket price:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
