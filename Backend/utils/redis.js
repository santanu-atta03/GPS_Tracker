import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://localhost:6379",
  socket: {
    connectTimeout: 2000,
    reconnectStrategy: false
  }
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisClient.on("error", (err) => {
  // console.error("❌ Redis Error:", err);
});

console.log("Attempting to connect to Redis...");
try {
  await redisClient.connect();
  console.log("Redis connected.");
} catch (err) {
  console.log("⚠️ Redis connection failed (running without Redis)");
}

export default redisClient;
