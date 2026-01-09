const PrivacyPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-muted-foreground">
            GPS Tracker (“we”, “our”, or “us”) respects your privacy and is
            committed to protecting your personal data. This Privacy Policy
            explains how we collect, use, store, and protect your information
            when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Personal Information:</strong> Name, email address,
              profile image (if logged in via authentication providers).
            </li>
            <li>
              <strong>Location Data:</strong> Real-time and historical GPS
              location data of vehicles or buses you track.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, time
              spent on the platform, and interaction logs.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, IP address,
              operating system, and device identifiers.
            </li>
            <li>
              <strong>Payment Information:</strong> Payment status and metadata
              (actual card details are never stored by us).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To provide real-time GPS tracking and map visualization</li>
            <li>To improve accuracy, performance, and reliability</li>
            <li>To process ticketing and payments</li>
            <li>To provide customer support and notifications</li>
            <li>To ensure platform security and prevent misuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Location Data Usage</h2>
          <p className="text-muted-foreground">
            Location data is collected strictly for tracking, navigation, and
            route visualization purposes. We do not sell or share precise
            location data with third parties for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
          <p className="text-muted-foreground">
            We may share limited data only with trusted third-party services
            such as authentication providers, payment gateways, and map services
            strictly to deliver core functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Data Security</h2>
          <p className="text-muted-foreground">
            We implement industry-standard security practices including
            encryption, access control, and secure APIs. However, no system is
            100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies and local storage to maintain sessions, preferences,
            and improve user experience. You can disable cookies in your browser
            settings, though some features may not function properly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access or update your personal data</li>
            <li>Request deletion of your account</li>
            <li>Withdraw consent where applicable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy periodically. Continued use of the
            service after changes implies acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions regarding this Privacy Policy, contact us at:
            <br />
            <strong>support@gpstracker.app</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
