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
  ratings: {
    punctuality: { type: Number, min: 1, max: 5, required: true },
    comfort: { type: Number, min: 1, max: 5, required: true },
    cleanliness: { type: Number, min: 1, max: 5, required: true },
    driverBehavior: { type: Number, min: 1, max: 5, required: true },
    safety: { type: Number, min: 1, max: 5, required: true },
    valueForMoney: { type: Number, min: 1, max: 5, required: true },
  },
  timeSlots: [
    {
      startTime: {
        type: String,  
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
