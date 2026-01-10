import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { ThemeToggle } from "../page/theme-toggle";

const Navbar = () => {
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();
  const { usere, darktheme } = useSelector((store) => store.auth);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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

    kok: { name: "कोंकणी", flag: "🇮🇳" },
    or: { name: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    ne: { name: "नेपाली", flag: "🇳🇵" },
    sat: { name: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
    sd: { name: "سنڌي", flag: "🇵🇰" },
    mni: { name: "মেইতেই লোন", flag: "🇮🇳" },
    ks: { name: "كٲشُر", flag: "🇮🇳" },
    as: { name: "অসমীয়া", flag: "🇮🇳" },
  };

  // Check if route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
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
    <div
      className={`w-full backdrop-blur-md shadow-lg px-4 sm:px-6 py-3 relative ${
        darktheme
          ? "bg-gray-800/80 border-b border-gray-700"
          : "bg-white/80 border-b border-green-100"
      }`}
    >
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
            <p
              className={`text-xs sm:text-sm ${
                darktheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
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
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.home")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              {usere?.status === "driver" ? (
                <div
                  onClick={() => handleNavigation("/Bus")}
                  className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                    isActiveRoute("/Bus")
                      ? darktheme
                        ? "text-green-400"
                        : "text-green-600"
                      : darktheme
                      ? "text-gray-300 hover:text-green-400"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  {t("navbar.busDetails")}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                      isActiveRoute("/Bus")
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </div>
              ) : null}

              <div
                onClick={() => handleNavigation("/view/map")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/view/map")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.map")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/view/map")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              <div
                onClick={() => handleNavigation("/find/ticket")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/find/ticket")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.ticket")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/find/ticket")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              <div
                onClick={() => handleNavigation("/nearBy/search")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/nearBy/search")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.nearBy")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/nearBy/search")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              <div
                onClick={() => handleNavigation("/see-history")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/see-history")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.history")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/see-history")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-green-600" />
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  darktheme
                    ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                    : "bg-white/70 border-green-200 text-gray-700 hover:bg-white"
                }`}
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
                  <div
                    className={`flex items-center cursor-pointer space-x-3 rounded-full px-3 py-2 transition-all duration-200 border ${
                      darktheme
                        ? "bg-gray-700/50 hover:bg-gray-700 border-gray-600 hover:border-gray-500"
                        : "bg-white/50 hover:bg-white/80 border-gray-200 hover:border-green-200"
                    }`}
                  >
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
                    <span
                      className={`font-medium hidden xl:block ${
                        darktheme ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {user?.name}
                    </span>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className={`w-48 backdrop-blur-md shadow-xl ${
                    darktheme
                      ? "bg-gray-800/95 border border-gray-700"
                      : "bg-white/95 border border-green-100"
                  }`}
                >
                  <Button
                    variant="outline"
                    className={`w-full mb-2 ${
                      darktheme
                        ? "border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 bg-gray-900"
                        : "border-green-200 text-gray-700 hover:bg-green-50 hover:border-green-300"
                    }`}
                    onClick={() => navigate("/profile")}
                  >
                    {t("navbar.viewProfile")}
                  </Button>
                  <Button
                    className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white border-0"
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
            <ThemeToggle />
          </div>

          {/* Mobile Live Badge */}
          <div
            className={`lg:hidden flex items-center space-x-2 rounded-full px-3 py-1.5 border ${
              darktheme
                ? "bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700"
                : "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
            }`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span
              className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                darktheme ? "text-green-400" : "text-green-700"
              }`}
            >
              {t("navbar.liveTracking")}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden mobile-menu-container">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                darktheme
                  ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                  : "bg-white/50 border-gray-200 hover:bg-white/80"
              }`}
              aria-label={t("navbar.toggleMenu")}
            >
              {isMobileMenuOpen ? (
                <X
                  className={`w-6 h-6 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden w-full backdrop-blur-md shadow-xl border-b z-50 mobile-menu-container ${
            darktheme
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-green-100"
          }`}
        >
          <div className="px-4 py-4 space-y-4">
            {/* Links */}
            <div className="space-y-3">
              <div
                onClick={() => handleNavigation("/")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.home")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              {usere?.status === "driver" ? (
                <div
                  onClick={() => handleNavigation("/Bus")}
                  className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                    isActiveRoute("/Bus")
                      ? darktheme
                        ? "text-green-400"
                        : "text-green-600"
                      : darktheme
                      ? "text-gray-300 hover:text-green-400"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  {t("navbar.busDetails")}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                      isActiveRoute("/Bus")
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </div>
              ) : null}

              <div
                onClick={() => handleNavigation("/view/map")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/view/map")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.map")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/view/map")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              <div
                onClick={() => handleNavigation("/find/ticket")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/find/ticket")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.ticket")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/find/ticket")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              <div
                onClick={() => handleNavigation("/nearBy/search")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/nearBy/search")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.nearBy")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/nearBy/search")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
              <div
                onClick={() => handleNavigation("/see-history")}
                className={`cursor-pointer font-semibold transition-colors duration-200 relative group ${
                  isActiveRoute("/see-history")
                    ? darktheme
                      ? "text-green-400"
                      : "text-green-600"
                    : darktheme
                    ? "text-gray-300 hover:text-green-400"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {t("navbar.history")}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-200 ${
                    isActiveRoute("/see-history")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-3 py-2 px-3">
              <Globe className="w-4 h-4 text-green-600" />
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  darktheme
                    ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                    : "bg-white/70 border-green-200 text-gray-700 hover:bg-white"
                }`}
              >
                {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                  <option key={code} value={code}>
                    {flag} {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth */}
            <div
              className={`px-3 pt-2 ${darktheme ? "bg-gray-800" : "bg-white"}`}
            >
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div
                    className={`flex items-center space-x-3 rounded-lg px-3 py-3 border ${
                      darktheme
                        ? "bg-gray-700/50 border-gray-600"
                        : "bg-white/50 border-gray-200"
                    }`}
                  >
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
                    <span
                      className={`font-medium ${
                        darktheme ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {user?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className={`w-full mb-2 ${
                      darktheme
                        ? "border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 bg-gray-900"
                        : "border-green-200 text-gray-700 hover:bg-green-50 hover:border-green-300"
                    }`}
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.viewProfile")}
                  </Button>
                  <Button
                    className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white border-0"
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
          <ThemeToggle />
        </div>
      )}
    </div>
  );
};

export default Navbar;
