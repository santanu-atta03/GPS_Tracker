import connectToMongo from "./utils/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import locationRoute from "./routes/location.route.js";

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;
app.use(express.json())
// ✅ CORS Options
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Middlewares

// ✅ Public Test Route
app.use("/api/v1",locationRoute)
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from backend",
  });
});

// ✅ API Routes

app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
