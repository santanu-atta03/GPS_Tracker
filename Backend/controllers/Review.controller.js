import Bus from "../models/Bus.model.js";
import Review from "../models/Review.model.js";
import User from "../models/User.model.js";
// import your Bus model

export const createReview = async (req, res) => {
  try {
    const { busId, ratings, comment } = req.body;
    const userId = req.auth.sub;

    let user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "Login first",
        success: false,
      });
    }

    if (!busId || !ratings) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const existingReview = await Review.findOne({ busId, userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this bus" });
    }

    for (let key of Object.keys(ratings)) {
      if (ratings[key] < 1 || ratings[key] > 5) {
        return res.status(400).json({
          success: false,
          message: `${key} rating must be between 1 and 5`,
        });
      }
    }

    const review = new Review({
      busId,
      userId,
      ratings,
      comment,
    });
    await review.save();

    const bus = await Bus.findOne({ deviceID: busId });

    if (!bus) {
      return res.status(404).json({ success: false, message: "Bus not found" });
    }

    const totalReviews = await Review.countDocuments({ busId });

    let newRatings = { ...bus.ratings };
    for (let key of Object.keys(ratings)) {
      const currentAvg = bus.ratings[key] || 0;
      const newAvg =
        (currentAvg * (totalReviews - 1) + ratings[key]) / totalReviews;
      newRatings[key] = parseFloat(newAvg.toFixed(2));
    }

    bus.ratings = newRatings;
    await bus.save();

    return res.status(200).json({
      success: true,
      message: "Review added successfully & bus ratings updated",
      data: review,
      updatedRatings: bus.ratings,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
