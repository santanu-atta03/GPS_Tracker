export const updatelocation = async (req, res) => {
  try {
    const { deviceID, latitude, longitude } = req.body;
    const newLocation = new Location({
      deviceID,
      location: { type: "Point", coordinates: [longitude, latitude] },
    });
    await newLocation.save();
    res.json({ success: true, message: "Location saved" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getLocation = async (req, res) => {
  try {
    const latestLocations = await 
       
    res.json(latestLocations.map((item) => item.latest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
