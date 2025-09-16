import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  deviceID: {
    type: String,
    required: true,
  },
  route: [
    {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
      },
    },
  ],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});
 
const Location = mongoose.model("Location", busSchema);
export default Location;
