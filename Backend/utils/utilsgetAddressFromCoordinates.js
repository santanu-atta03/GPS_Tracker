// utils/getAddressFromCoordinates.js
import axios from "axios";

// 🗺️ Map of Indian states → Local language code + local name
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

  // Hindi-speaking states
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

// 🌍 Get full address from coordinates (in local language)
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    // Step 1: Reverse geocode using OpenStreetMap (Nominatim)
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon: lng,
        format: "json",
        addressdetails: 1,
        zoom: 18, // more detailed
      },
      headers: { "User-Agent": "BusTicketApp" },
    });

    const address = res.data.address || {};
    const stateName =
      address.state || address.region || address.country || "Unknown";

    // Build English full address string
    const englishAddress = [
      address.house_number,
      address.road,
      address.suburb,
      address.city || address.town || address.village,
      stateName,
      address.postcode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");

    // Step 2: Determine local language based on state
    const langCode = STATE_LANGUAGE_MAP[stateName]?.lang || "hi"; // fallback Hindi

    // Step 3: Translate the full address to local language
    const translateRes = await axios.get(
      "https://translate.googleapis.com/translate_a/single",
      {
        params: {
          client: "gtx",
          sl: "en",
          tl: langCode,
          dt: "t",
          q: englishAddress,
        },
      }
    );

    const translatedAddress =
      translateRes.data?.[0]?.map((a) => a[0]).join("") || englishAddress;

    return {
      english: englishAddress,
      local: translatedAddress,
      state: {
        english: stateName,
        local: STATE_LANGUAGE_MAP[stateName]?.local || stateName,
      },
    };
  } catch (error) {
    console.error("Error converting coordinates to address:", error.message);
    return {
      english: "Unknown place",
      local: "অজানা স্থান",
      state: { english: "Unknown", local: "অজানা" },
    };
  }
};

export default getAddressFromCoordinates;
