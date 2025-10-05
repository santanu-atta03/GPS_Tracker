import connectToMongo from "./utils/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import locationRoute from "./routes/location.route.js";
import { auth } from "express-oauth2-jwt-bearer";
import cookieParser from "cookie-parser";
import driverRoute from "./routes/Driver.route.js";
import BusRoute from "./routes/bus.route.js";
import JourneyRoute from "./routes/journey.route.js";
import UserRoute from "./routes/User.route.js";
import findBusRoute from "./routes/MyLocation.route.js";
import ReviewRoute from "./routes/Review.route.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import bodyParser from "body-parser";
dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;

const razorpay = new Razorpay({
  key_id: "rzp_test_RPcZFwp7G16Gjf",
  key_secret: "tUB9roW7JPgT4qJutNMxbrAZ",
});

// ✅ CORS Options
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://gps-map-nine.vercel.app",
    "https://gps-tracker-ecru.vercel.app",
  ],

  credentials: true,
};

app.use(cors(corsOptions));

app.get("/authorized", (req, res) => {
  res.send("Secured Resource");
});

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ✅ Public Test Route

app.use("/api/v1/Myroute", findBusRoute);

app.use("/api/v1", locationRoute);
app.use("/api/v1/driver", driverRoute);
app.use("/api/v1/Bus", BusRoute);
app.use("/api/v1/", JourneyRoute);
app.use("/api/v1/user", UserRoute);

app.use("/api/v1/review", ReviewRoute);

app.get("/api/v1/search", async (req, res) => {
  try {
    const query = req.query.q;
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=pk.769b04a589221b0a3c78f5a7509d19ba&q=${encodeURIComponent(
        query
      )}&format=json`,
      {
        headers: {
          "User-Agent": "myapp/1.0", // Nominatim requires this
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Nominatim" });
  }
});
app.get("/api/v1/reverse-geocode", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Missing 'lat' or 'lon' parameter" });
    }

    const url = `https://us1.locationiq.com/v1/reverse?key=pk.769b04a589221b0a3c78f5a7509d19ba&lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "myapp/1.0", // Optional for LocationIQ, but fine
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Reverse geocode error:", err);
    res.status(500).json({ error: "Failed to fetch reverse geocoding data" });
  }
});

app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating order");
  }
});
app.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: "✅ Payment verified successfully!" });
    } else {
      res.json({ success: false, message: "❌ Payment verification failed!" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from backend",
  });
});

app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
