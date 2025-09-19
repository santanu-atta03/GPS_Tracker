import Bus from "../models/Bus.model.js";
import Driver from "../models/Driver.model.js";
import Location from "../models/Location.model.js";

export const CreateDriver = async (req, res) => {
  try {
    const {name, deviceID, to, from } = req.body;
    if (!name || !deviceID || !to || !from) {
      return res.status(400).json({
        message: " all fild are required",
        success: false,
      });
    }
    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "login first",
        success: false,
      });
    }
    const existingBus = await Location.findOne({ deviceID });
    if (existingBus) {
      return res.status(400).json({
        message: "bus already registered",
        success: false,
      });
    }

    // ✅ Correct way (no extra nesting)
    const newBusdetails = await Location.create({ deviceID });

    const busDetails = {
      name:name,
      deviceID: deviceID,
      to: to,
      from: from,
      driver: user._id,
      location:newBusdetails._id
    };
    const newBus = await Bus.create(busDetails);
    return res.status(200).json({
      message: "bus details create success fully",
      newBus,
      newBusdetails,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};


