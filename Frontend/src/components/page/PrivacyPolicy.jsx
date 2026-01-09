import Navbar from "../shared/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-20">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400 mb-10">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                1. Introduction
              </h2>
              <p>
                Where is My Bus (“we”, “our”, or “us”) is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                and safeguard your information when you use our GPS tracking
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
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
              <h2 className="text-xl font-semibold text-white mb-2">
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
              <h2 className="text-xl font-semibold text-white mb-2">
                4. Location Data
              </h2>
              <p>
                Location data is used strictly for navigation, route tracking,
                and live map visualization. We do not sell or misuse precise
                location data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                5. Data Sharing
              </h2>
              <p>
                We only share data with trusted third-party services (maps,
                authentication, payments) strictly to deliver core
                functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                6. Data Security
              </h2>
              <p>
                We use industry-standard security practices; however, no digital
                platform can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                7. Your Rights
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and update your information</li>
                <li>Request account deletion</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                8. Contact
              </h2>
              <p>
                For privacy-related questions, contact us at:
                <br />
                <span className="text-green-400 font-medium">
                  support@gpstracker.app
                </span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
