import connectToMongo from "./utils/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import locationRoute from "./routes/location.route.js";
import { auth } from "express-oauth2-jwt-bearer";
import cookieParser from "cookie-parser";
import driverRoute from "./routes/Driver.route.js";
import BusRoute from "./routes/bus.route.js";

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;

// ✅ CORS Options
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));
// const jwtCheck = auth({
//   audience: process.env.AUTH0_AUDIENCE,
//   issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
//   tokenSigningAlg: "RS256",
// });

// ✅ Secured Test Route
app.get("/authorized", (req, res) => {
  res.send("Secured Resource");
});

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ✅ Public Test Route

app.use("/api/v1", locationRoute);
app.use("/api/v1/driver", driverRoute);
app.use("/api/v1/Bus",BusRoute)
app.get("/api/v1/search", async (req, res) => {
  try {
    const query = req.query.q;
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json`,
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
      return res.status(400).json({ error: "Missing 'lat' or 'lon' parameter" });
    }

    const url = `https://us1.locationiq.com/v1/reverse?key=${process.env.LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`;

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

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from backend",
  });
});

// ✅ API Routes

app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
