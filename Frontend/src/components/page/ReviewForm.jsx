import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";

const ReviewForm = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [formData, setFormData] = useState({
    punctuality: 3,
    comfort: 3,
    cleanliness: 3,
    driverBehavior: 3,
    safety: 3,
    valueForMoney: 3,
    comment: "",
  });
  const { busId } = useParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/review/reviews`,
        {
          busId,
          ratings: {
            punctuality: formData.punctuality,
            comfort: formData.comfort,
            cleanliness: formData.cleanliness,
            driverBehavior: formData.driverBehavior,
            safety: formData.safety,
            valueForMoney: formData.valueForMoney,
          },
          comment: formData.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Review submitted successfully!");
      console.log("Review response:", res.data);
      setFormData({
        punctuality: 3,
        comfort: 3,
        cleanliness: 3,
        driverBehavior: 3,
        safety: 3,
        valueForMoney: 3,
        comment: "",
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = {
    punctuality: "Punctuality",
    comfort: "Comfort",
    cleanliness: "Cleanliness",
    driverBehavior: "Driver Behavior",
    safety: "Safety",
    valueForMoney: "Value For Money",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit a Review</h2>
            <p className="text-gray-600">Share your experience with this bus service</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Rating Grid - 2 columns, 3 rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {Object.entries(ratingLabels).map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      {[1, 2, 3, 4, 5].map((val) => (
                        <option key={val} value={val}>
                          {val} {val === 1 ? "Star" : "Stars"}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= formData[field]
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Section - Full Width */}
            <div className="space-y-2 mb-8">
              <label className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                rows="4"
                placeholder="Share your experience with this bus service..."
              ></textarea>
            </div>

            {/* Submit Button - Full Width */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Review
                </>
              )}
            </button>

            {message && (
              <div
                className={`mt-4 p-4 rounded-lg text-center font-medium ${
                  message.includes("success")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;