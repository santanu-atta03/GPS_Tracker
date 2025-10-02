import mongoose from "mongoose";

const BusDetails = mongoose.Schema({
  deviceID: {
    type: String,
    required: true,
  },
  name: {
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
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  timeSlots: [
    {
      startTime: {
        type: String, // could also use Date if exact timestamp needed
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
  ],
});

const Bus = mongoose.model("Bus", BusDetails);
export default Bus;
