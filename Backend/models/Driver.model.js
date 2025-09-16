import mongoose from "mongoose";

const DriverDetails = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
  },
  licenceId: {
    type: String,
    required: true,
    unique: true,
  },
  driverExp: {
    type: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Driver = mongoose.model("Driver", DriverDetails);
export default Driver;
