import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Navigation, Globe, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Navbar = () => {
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const LANGUAGES = {
    en: { name: "English", flag: "🇺🇸" },
    hi: { name: "हिन्दी", flag: "🇮🇳" },
    ta: { name: "தமிழ்", flag: "🇮🇳" },
    te: { name: "తెలుగు", flag: "🇮🇳" },
    kn: { name: "ಕನ್ನಡ", flag: "🇮🇳" },
    ml: { name: "മലയാളം", flag: "🇮🇳" },
    bn: { name: "বাংলা", flag: "🇮🇳" },
    gu: { name: "ગુજરાતી", flag: "🇮🇳" },
    mr: { name: "मराठी", flag: "🇮🇳" },
    pa: { name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    ur: { name: "اُردُو", flag: "🇵🇰" }, // or 🇮🇳 if preferred
    kok: { name: "कोंकणी", flag: "🇮🇳" },
    or: { name: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    ne: { name: "नेपाली", flag: "🇳🇵" },
    sat: { name: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
    sd: { name: "سنڌي", flag: "🇵🇰" }, // or 🇮🇳 if preferred
    mni: { name: "মেইতেই লোন", flag: "🇮🇳" },
    ks: { name: "كٲشُر", flag: "🇮🇳" },
    as: { name: "অসমীয়া", flag: "🇮🇳" },
  };

  // Language Change
  const handleLanguageChange = (langCode) => {
    if (!langCode) return;
    setSelectedLang(langCode);
    localStorage.setItem("selectedLanguage", langCode);
    i18n.changeLanguage(langCode);
  };

  // Navigation
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("loginShown");
    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };
  // Init Language on Mount
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setSelectedLang(savedLang);
    }
  }, [i18n]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="w-full bg-white/80 backdrop-blur-md shadow-lg border-b border-green-100 px-4 sm:px-6 py-3 relative">
      <header className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left Side - Logo & App Name */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Navigation className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
          </div>
          {/* Desktop Title */}
          <div className="hidden md:block">
            <h1 className="text-2xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              {t("navbar.appName")}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("navbar.tagline")}
            </p>
          </div>
          {/* Mobile Title */}
          <div className="block md:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              {t("navbar.appName")}
            </h1>
          </div>
        </div>

        {/* Center Badge (Desktop only) */}

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Nav Links */}
            <div className="flex items-center gap-6">
              <div
                onClick={() => handleNavigation("/")}
                className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
              >
                {t("navbar.home")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
              </div>
              {usere?.status === "driver" ? (
                <div
                  onClick={() => handleNavigation("/Bus")}
                  className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
                >
                  {t("navbar.busDetails")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
                </div>
              ) : null}

              <div
                onClick={() => handleNavigation("/view/map")}
                className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
              >
                {t("navbar.map")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
              </div>
              <div
                onClick={() => handleNavigation("/find/ticket")}
                className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
              >
                ticket
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
              </div>
              <div
                onClick={() => handleNavigation("/nearBy/search")}
                className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
              >
                NearBy
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-green-600" />
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-white/70 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                  <option key={code} value={code}>
                    {flag} {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Authentication */}
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center cursor-pointer space-x-3 bg-white/50 rounded-full px-3 py-2 hover:bg-white/80 transition-all duration-200 border border-gray-200 hover:border-green-200">
                    {user?.picture ? (
                      <Avatar className="w-10 h-10 border-2 border-green-200">
                        <AvatarImage
                          src={
                            user?.picture ||
                            usere?.picture ||
                            `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`
                          }
                          alt={user?.name}
                          className="object-cover"
                        />
                      </Avatar>
                    ) : (
                      <Avatar className="w-10 h-10 border-2 border-green-200">
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-gray-800 font-medium hidden xl:block">
                      {user?.name}
                    </span>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className="w-48 bg-white/95 backdrop-blur-md border border-green-100 shadow-xl"
                >
                  <Button
                    variant="outline"
                    className="w-full mb-2 border-green-200 text-gray-700 hover:bg-green-50 hover:border-green-300"
                    onClick={() => navigate("/profile")}
                  >
                    {t("navbar.viewProfile")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-500 hover:bg-red-600"
                    onClick={handleLogout}
                  >
                    {t("navbar.logout")}
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                onClick={() => loginWithRedirect()}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {t("navbar.login")}
              </Button>
            )}
          </div>

          {/* Mobile Live Badge */}
          <div className="lg:hidden flex items-center space-x-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full px-3 py-1.5 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-green-700 whitespace-nowrap">
              Live
            </span>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden mobile-menu-container">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/50 border border-gray-200 hover:bg-white/80 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden w-full bg-white backdrop-blur-md shadow-xl
                  border-b border-green-100 z-50 mobile-menu-container"
        >
          <div className="px-4 py-4 space-y-4">
            {/* Links */}
            <div className="space-y-3">
              <div
                onClick={() => handleNavigation("/")}
                className="block cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-green-50"
              >
                {t("navbar.home")}
              </div>
              {usere?.status === "driver" ? (
                <div
                  onClick={() => handleNavigation("/Bus")}
                  className="block cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-green-50"
                >
                  {t("navbar.busDetails")}
                </div>
              ) : (
                <div></div>
              )}

              <div
                onClick={() => handleNavigation("/view/map")}
                className="block cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-green-50"
              >
                {t("navbar.map")}
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-3 py-2 px-3">
              <Globe className="w-4 h-4 text-green-600" />
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="flex-1 bg-white/70 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                  <option key={code} value={code}>
                    {flag} {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth */}
            <div className="px-3 pt-2 bg-white">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 bg-white/50 rounded-lg px-3 py-3 border border-gray-200">
                    {user?.picture ? (
                      <Avatar className="w-10 h-10 border-2 border-green-200">
                        <AvatarImage
                          src={
                            user?.picture ||
                            usere?.picture ||
                            `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`
                          }
                          alt={user?.name}
                          className="object-cover"
                        />
                      </Avatar>
                    ) : (
                      <Avatar className="w-10 h-10 border-2 border-green-200">
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-gray-800 font-medium">
                      {user?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mb-2 border-green-200 text-gray-700 hover:bg-green-50 hover:border-green-300"
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.viewProfile")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-500 hover:bg-red-600"
                    onClick={handleLogout}
                  >
                    {t("navbar.logout")}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    loginWithRedirect();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t("navbar.login")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
