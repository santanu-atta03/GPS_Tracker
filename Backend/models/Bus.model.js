import mongoose from "mongoose";

const BusDetails = mongoose.Schema({
  deviceID: {
    type: String,
    required: true,
  },
  to: {
    type: String,
  },
  from: {
    type: String,
  },
  driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
});

const Bus = mongoose.model("Bus", BusDetails);
export default Bus;
