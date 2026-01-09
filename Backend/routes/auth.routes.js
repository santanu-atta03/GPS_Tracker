import express from "express";
import otpGenerator from "otp-generator";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";
import redisClient from "../utils/redis.js";

const email_route = express.Router();

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60;

email_route.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendEmail(email, otp);

  res.json({ success: true, message: "OTP sent to email" });
});

email_route.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const lockKey = `lock:${email}`;
  const attemptsKey = `attempts:${email}`;

  try {
    const isLocked = await redisClient.get(lockKey);
    if (isLocked) {
      return res.status(429).json({
        success: false,
        message: "Account locked due to too many failed attempts. Please try again in 15 minutes.",
      });
    }

    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < new Date()) {
      const attempts = await redisClient.incr(attemptsKey);

      if (attempts === 1) {
        await redisClient.expire(attemptsKey, 60 * 60);
      }

      if (attempts >= MAX_ATTEMPTS) {
        await redisClient.setEx(lockKey, LOCK_TIME, "true");
        await redisClient.del(attemptsKey);
        return res.status(429).json({
          success: false,
          message: "Too many failed attempts. Account locked for 15 minutes.",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${MAX_ATTEMPTS - attempts} attempts remaining.`,
      });
    }

    await Otp.deleteMany({ email });
    await redisClient.del(attemptsKey);
    await redisClient.del(lockKey);

    res.json({ success: true });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default email_route;