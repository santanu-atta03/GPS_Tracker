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
    let user = await Driver.findOne({ auth0Id: userId });
    if (user) {
      return res.status(404).json({
        message: "User already exiect",
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
