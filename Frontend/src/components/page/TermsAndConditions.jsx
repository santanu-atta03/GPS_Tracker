import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";

const TermsAndConditions = () => {
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
              Terms & Conditions
            </h1>

            <p
              className={`text-sm mb-10 ${
                darktheme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8 text-sm leading-relaxed">
              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Where is My Bus, you agree to comply with
                  and be bound by these Terms & Conditions. If you do not agree,
                  please discontinue use of the service.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  2. Description of Service
                </h2>
                <p>
                  Where is My Bus provides real-time GPS tracking, route
                  visualization, ticketing, and related transportation services.
                  Features may evolve over time.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  3. User Responsibilities
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and lawful information</li>
                  <li>Do not misuse or abuse the platform</li>
                  <li>Do not interfere with tracking systems or APIs</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  4. Accounts & Security
                </h2>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account credentials. We are not liable for unauthorized
                  access resulting from user negligence.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  5. Payments & Tickets
                </h2>
                <p>
                  Payments are processed via third-party providers. Where is My
                  Bus does not store sensitive payment details. Refunds, if any,
                  are subject to provider policies.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  6. Service Availability
                </h2>
                <p>
                  We strive to maintain uninterrupted service but do not
                  guarantee uptime. Temporary outages may occur due to
                  maintenance or technical issues.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  7. Limitation of Liability
                </h2>
                <p>
                  Where is My Bus shall not be liable for any indirect,
                  incidental, or consequential damages arising from the use or
                  inability to use the service.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  8. Termination
                </h2>
                <p>
                  We reserve the right to suspend or terminate access to the
                  platform for violations of these terms or misuse of the
                  service.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  9. Intellectual Property
                </h2>
                <p>
                  All content, trademarks, and software associated with Where is
                  My Bus remain the intellectual property of their respective
                  owners.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  10. Governing Law
                </h2>
                <p>
                  These Terms & Conditions are governed by the laws of India.
                  Any disputes shall fall under the jurisdiction of Indian
                  courts.
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  11. Contact Information
                </h2>
                <p>
                  For questions regarding these Terms & Conditions, contact us
                  at:
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

export default TermsAndConditions;
