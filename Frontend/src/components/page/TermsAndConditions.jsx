const TermsAndConditions = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using GPS Tracker, you agree to comply with and be
            bound by these Terms & Conditions. If you do not agree, please do
            not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
          <p className="text-muted-foreground">
            GPS Tracker provides real-time vehicle tracking, map visualization,
            ticketing, and related services. Features may change or evolve over
            time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide accurate and lawful information</li>
            <li>Do not misuse or attempt to exploit the platform</li>
            <li>Do not interfere with tracking systems or APIs</li>
            <li>Comply with local laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Account Security</h2>
          <p className="text-muted-foreground">
            You are responsible for maintaining the confidentiality of your
            account credentials. We are not liable for unauthorized access
            caused by user negligence.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Payments & Tickets</h2>
          <p className="text-muted-foreground">
            Payments are processed through third-party payment providers. GPS
            Tracker does not store sensitive payment information. Refunds, if
            applicable, are subject to provider policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Service Availability</h2>
          <p className="text-muted-foreground">
            We strive to maintain uptime but do not guarantee uninterrupted
            service. Downtime may occur due to maintenance, technical issues, or
            external dependencies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            GPS Tracker shall not be liable for any indirect, incidental, or
            consequential damages arising from the use or inability to use the
            service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right to suspend or terminate accounts that violate
            these terms or misuse the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All content, logos, and software associated with GPS Tracker are the
            intellectual property of their respective owners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may modify these Terms & Conditions at any time. Continued use
            of the service constitutes acceptance of updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Governing Law</h2>
          <p className="text-muted-foreground">
            These terms are governed by the laws of India. Any disputes shall
            be subject to the jurisdiction of Indian courts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">12. Contact Information</h2>
          <p className="text-muted-foreground">
            For questions regarding these Terms & Conditions, contact:
            <br />
            <strong>support@gpstracker.app</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
