import axios from "axios";

// Indian states → Local language mapping
const STATE_LANGUAGE_MAP = {
  "West Bengal": { lang: "bn", local: "পশ্চিমবঙ্গ" },
  "Tripura": { lang: "bn", local: "ত্রিপুরা" },
  "Manipur": { lang: "bn", local: "মণিপুর" },
  "Meghalaya": { lang: "bn", local: "মেঘালয়" },
  "Nagaland": { lang: "bn", local: "নাগাল্যান্ড" },
  "Mizoram": { lang: "bn", local: "মিজোরাম" },
  "Sikkim": { lang: "bn", local: "সিকিম" },
  "Maharashtra": { lang: "mr", local: "महाराष्ट्र" },
  "Goa": { lang: "mr", local: "गोवा" },
  "Gujarat": { lang: "gu", local: "ગુજરાત" },
  "Tamil Nadu": { lang: "ta", local: "தமிழ்நாடு" },
  "Kerala": { lang: "ml", local: "കേരളം" },
  "Karnataka": { lang: "kn", local: "ಕರ್ನಾಟಕ" },
  "Telangana": { lang: "te", local: "తెలంగాణ" },
  "Andhra Pradesh": { lang: "te", local: "ఆంధ్ర ప్రదేశ్" },
  "Punjab": { lang: "pa", local: "ਪੰਜਾਬ" },
  "Haryana": { lang: "hi", local: "हरियाणा" },
  "Delhi": { lang: "hi", local: "दिल्ली" },
  "Uttar Pradesh": { lang: "hi", local: "उत्तर प्रदेश" },
  "Madhya Pradesh": { lang: "hi", local: "मध्य प्रदेश" },
  "Rajasthan": { lang: "hi", local: "राजस्थान" },
  "Bihar": { lang: "hi", local: "बिहार" },
  "Jharkhand": { lang: "hi", local: "झारखण्ड" },
  "Chhattisgarh": { lang: "hi", local: "छत्तीसगढ़" },
  "Himachal Pradesh": { lang: "hi", local: "हिमाचल प्रदेश" },
  "Uttarakhand": { lang: "hi", local: "उत्तराखण्ड" },
  "Odisha": { lang: "or", local: "ଓଡ଼ିଶା" },
  "Assam": { lang: "as", local: "অসম" },
};

const OPENCAGE_API_KEY = "9aef89cb32dd491d8b961021dafaff47";

const getAddressFromCoordinates = async ([lat, lon]) => {
  try {
    const res = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
      params: {
        q: `${lat}+${lon}`,
        key: OPENCAGE_API_KEY,
        language: "en",
        pretty: 1,
      },
    });

    const result = res.data.results[0];
    if (!result) return "Unknown location";

    const components = result.components || {};
    const stateName = components.state || components.region || "Unknown";

    // Build English full address
    const englishAddress = result.formatted;

    // Get local state name
    const localStateName = STATE_LANGUAGE_MAP[stateName]?.local || stateName;

    return {
      english: englishAddress,
      state: { english: stateName, local: localStateName },
    };
  } catch (err) {
    console.error("Geocoding error:", err.response?.status, err.message);
    return {
      english: "Unknown location",
      state: { english: "Unknown", local: "অজানা" },
    };
  }
};

export default getAddressFromCoordinates;
