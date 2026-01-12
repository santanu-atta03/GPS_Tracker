// routes/busReviewRoutes.js
import express from "express";
import { createReview } from "../controllers/Review.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const ReviewRoute = express.Router();

ReviewRoute.post("/reviews", isAuthenticated, createReview);

export default ReviewRoute;
