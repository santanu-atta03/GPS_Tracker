import {
  Navigation,
  Github,
  Mail,
  MapPin,
  FileText,
  Shield,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full mt-16 border-t border-gray-800 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">

        {/* 1. Brand (Left aligned as per standard design) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              GPS Tracker
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Real-time GPS tracking system for buses and vehicles with live map
            visualization, route tracking, and smart travel assistance.
          </p>
        </div>

        {/* 2. Quick Links (Already Centered) */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-center">
            {[
              { label: "Live Map", href: "/view/map" },
              { label: "Find Ticket", href: "/find/ticket" },
              { label: "Nearby Stops", href: "/nearBy/search" },
              { label: "History", href: "/see-history" },
            ].map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-muted-foreground hover:text-green-600 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Legal (Now Centered) */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Legal
          </h3>
          <ul className="space-y-2 text-sm text-center">
            <li>
              <a
                href="/privacy-policy"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-green-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms-and-conditions"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-green-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* 4. Connect (Now Centered) */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Connect
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>India</span>
            </div>
            <a
              href="https://github.com/ayanmanna123/GPS_Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 hover:text-green-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub Repository
            </a>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              <span>support@gpstracker.app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GPS Tracker. All rights reserved.</p>
          <p>Built with ❤️ using React & Leaflet</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;