// utils/getAddressFromCoordinates.js
import axios from 'axios';

const getAddressFromCoordinates = async ([lat, lon]) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
      },
      headers: {
        'User-Agent': 'YourAppName/1.0', // Required by Nominatim's policy
      },
    });

    return res.data.display_name || "Unknown location";
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return "Unknown location";
  }
};

export default getAddressFromCoordinates;
