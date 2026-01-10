import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";

const PrivacyPolicy = () => {
  const { darktheme } = useSelector((store) => store.auth);

  return (
    <div
      className={`min-h-screen ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
      }`}
    >
      <Navbar />

      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div
            className={`backdrop-blur-xl border rounded-2xl p-10 shadow-2xl ${
              darktheme
                ? "bg-gray-800/70 border-gray-700 text-gray-300"
                : "bg-white border-green-100 text-gray-700"
            }`}
          >
            <h1
              className={`text-3xl font-bold mb-2 ${
                darktheme ? "text-white" : "text-gray-800"
              }`}
            >
              Privacy Policy
            </h1>

            <p
              className={`text-sm mb-10 ${
                darktheme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Last updated: 9 January 2026
            </p>

            <div className="space-y-8 text-sm leading-relaxed">
              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  1. Introduction
                </h2>
                <p>
                  Where is My Bus (“we”, “our”, or “us”) is committed to
                  protecting your privacy. This Privacy Policy explains how we
                  collect, use, and safeguard your information when you use our
                  GPS tracking platform.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  2. Information We Collect
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal details such as name and email</li>
                  <li>Real-time and historical GPS location data</li>
                  <li>Device and browser information</li>
                  <li>Usage analytics and interaction logs</li>
                  <li>Payment metadata (no card details stored)</li>
                </ul>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  3. How We Use Information
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide real-time bus tracking</li>
                  <li>Improve service accuracy and reliability</li>
                  <li>Enable ticketing and payments</li>
                  <li>Ensure system security and prevent misuse</li>
                </ul>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  4. Location Data
                </h2>
                <p>
                  Location data is used strictly for navigation, route tracking,
                  and live map visualization. We do not sell or misuse precise
                  location data.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  5. Data Sharing
                </h2>
                <p>
                  We only share data with trusted third-party services (maps,
                  authentication, payments) strictly to deliver core
                  functionality.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  6. Data Security
                </h2>
                <p>
                  We use industry-standard security practices; however, no
                  digital platform can guarantee absolute security.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  7. Your Rights
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your information</li>
                  <li>Request account deletion</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  8. Contact
                </h2>
                <p>
                  For privacy-related questions, contact us at:
                  <br />
                  <span className="text-green-600 font-medium">
                    support@gpstracker.app
                  </span>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
