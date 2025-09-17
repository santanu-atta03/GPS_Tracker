import Bus from "../models/Bus.model.js";
import Driver from "../models/Driver.model.js";

export const createDriver = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { fullname, email, picture, licenceId, driverExp } = req.body;

    if (!fullname || !email || !picture || !licenceId || !driverExp) {
      return res.status(400).json({
        message: "all find is required",
        success: false,
      });
    }

    const newUser = {
      auth0Id: userId,
      name: fullname,
      email: email,
      picture: picture,
      licenceId: licenceId,
      driverExp: driverExp,
    };
    const userData = await Driver.create(newUser);
    return res.status(200).json({
      message: "user create success fully",
      userData,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const userFindByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email);
    const emailfind = await Driver.findOne({ email: email });
    if (!emailfind) {
      return res.status(404).json({
        message: "user not exict",
        success: false,
      });
    }
    return res.status(200).json({
      message: "user alredy exicet",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, licenceId, driverExp } = req.body;
    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "login first",
        success: false,
      });
    }
    if (fullname) {
      user.name = fullname;
    }
    if (licenceId) {
      user.licenceId = licenceId;
    }
    if (driverExp) {
      user.driverExp = driverExp;
    }
    const newDetails = await user.save();

    return res.status(200).json({
      message: "user update successfully",
      newDetails,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const DriverCreateBus = async (req, res) => {
  try {
    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "login first",
        success: false,
      });
    }
    const AllBus = await Bus.find({ driver: user._id }).populate([
      { path: "driver" },
      { path: "location" },
    ]);

    if (!AllBus) {
      return res.status(200).json({
        message: "no subject found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "this is your createed Bus",
      AllBus,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
