import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Navigation, Globe, Menu, X, Sparkles, ChevronDown, Home, MapPin, Bus, Ticket, Settings, HelpCircle, Info, History } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const isActiveRoute = (path) => location.pathname === path;

  const handleLanguageChange = (langCode) => {
    if (!langCode) return;
    setSelectedLang(langCode);
    localStorage.setItem("selectedLanguage", langCode);
    i18n.changeLanguage(langCode);
  };

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

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setSelectedLang(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest(".sidebar-container")) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const sidebarMenuItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/see-history", label: "My Trips", icon: History },
    { path: "/view/map", label: "Live Tracking", icon: MapPin },
    { path: "/nearBy/search", label: "Nearby Buses", icon: Bus },
    { path: "/find/ticket", label: "Tickets", icon: Ticket },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/help", label: "Help & Support", icon: HelpCircle },
    { path: "/about", label: "About", icon: Info },
  ];

  const handleSidebarNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`sidebar-container fixed top-0 left-0 h-full w-72 sm:w-80 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${darktheme ? "bg-gray-900" : "bg-white"} shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between p-6 border-b ${darktheme ? "border-gray-800" : "border-gray-200"
            }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darktheme
                  ? "bg-gradient-to-br from-blue-600 to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}>
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${darktheme ? "text-gray-100" : "text-gray-900"
                  }`}>
                  Menu
                </h2>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-2 rounded-lg transition-all hover:scale-110 ${darktheme
                  ? "hover:bg-gray-800 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSidebarNavigation(item.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${isActive
                        ? darktheme
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : darktheme
                          ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"
                      }`} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className={`p-4 border-t ${darktheme ? "border-gray-800" : "border-gray-200"
            }`}>
            <div className={`p-4 rounded-xl ${darktheme ? "bg-gray-800/50" : "bg-gray-50"
              }`}>
              <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"
                }`}>
                {t("navbar.appName")}
              </p>
              <p className={`text-xs mt-1 ${darktheme ? "text-gray-500" : "text-gray-500"
                }`}>
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-xl" : "shadow-lg"
          } ${darktheme
            ? "bg-gray-900/95 border-b border-gray-800"
            : "bg-white/95 border-b border-gray-200"
          } backdrop-blur-lg`}
      >
        <header className="w-full px-6 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            {/* Left Section: Hamburger + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${darktheme
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750 text-gray-300"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo Section */}
              <div className="flex items-center gap-3 flex-shrink-0 group/logo">
                <div className={`relative cursor-pointer ${scrolled ? 'scale-95' : ''} transition-all duration-300 group-hover/logo:scale-105`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover/logo:rotate-3 ${darktheme
                    ? "bg-gradient-to-br from-blue-600 to-purple-600"
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                    }`}>
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className={`w-4 h-4 ${darktheme ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
                  </div>
                </div>

                <div className="hidden md:block">
                  <h1 className={`text-2xl font-bold bg-gradient-to-r ${darktheme ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
                    } bg-clip-text text-transparent transition-all duration-300 group-hover/logo:tracking-wide`}>
                    {t("navbar.appName")}
                  </h1>
                  <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                    {t("navbar.tagline")}
                  </p>
                </div>

                <div className="block md:hidden">
                  <h1 className={`text-lg font-bold bg-gradient-to-r ${darktheme ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
                    } bg-clip-text text-transparent`}>
                    {t("navbar.appName")}
                  </h1>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Navigation Links */}
              <nav className="flex items-center gap-1">
                {[
                  { path: "/", label: t("navbar.home") },
                  ...(usere?.status === "driver" ? [{ path: "/Bus", label: t("navbar.busDetails") }] : []),
                  { path: "/view/map", label: t("navbar.map") },
                  { path: "/find/ticket", label: t("navbar.ticket") },
                  { path: "/nearBy/search", label: t("navbar.nearBy") },
                  { path: "/see-history", label: t("navbar.history") },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`relative group px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5 ${isActiveRoute(item.path)
                      ? darktheme
                        ? "text-blue-400"
                        : "text-blue-600"
                      : darktheme
                        ? "text-gray-300 hover:text-blue-400"
                        : "text-gray-700 hover:text-blue-600"
                      }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-center transition-transform duration-300 ease-out ${isActiveRoute(item.path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      } ${darktheme ? "bg-gradient-to-r from-blue-400 to-purple-400" : "bg-gradient-to-r from-blue-600 to-purple-600"
                      }`}></span>

                    {/* Subtle Glow Effect on Hover */}
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darktheme ? "bg-blue-500/10" : "bg-blue-50"
                      } -z-10`}></div>
                  </button>
                ))}
              </nav>

              {/* Live Badge */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 ${darktheme
                ? "bg-green-500/10 border-green-500/30 hover:border-green-500/50"
                : "bg-green-50 border-green-200 hover:border-green-300"
                }`}>
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full relative z-10"></div>
                </div>
                <span className={`text-sm font-semibold ${darktheme ? "text-green-400" : "text-green-700"
                  }`}>
                  {t("navbar.liveTracking")}
                </span>
              </div>

              {/* Language Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 ${darktheme
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750 text-gray-200"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}>
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">{LANGUAGES[selectedLang].flag}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className={`w-56 max-h-80 overflow-y-auto ${darktheme
                  ? "bg-gray-800/95 border-gray-700"
                  : "bg-white/95 border-gray-200"
                  } backdrop-blur-lg`}>
                  <div className="space-y-1">
                    {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${selectedLang === code
                          ? darktheme
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-blue-100 text-blue-700"
                          : darktheme
                            ? "hover:bg-gray-700 text-gray-300"
                            : "hover:bg-gray-100 text-gray-700"
                          }`}
                      >
                        <span className="text-lg">{flag}</span>
                        <span className="text-sm font-medium">{name}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Authentication */}
              {isAuthenticated ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${darktheme
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600"
                      : "bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-200"
                      }`}>
                      {/* Greeting Text */}
                      <span className={`text-sm font-normal hidden sm:block transition-all duration-300 ${darktheme ? "text-gray-400 group-hover:text-gray-300" : "text-gray-500 group-hover:text-gray-600"
                        }`}>
                        Hi,
                      </span>

                      {/* Username */}
                      <span className={`font-semibold hidden sm:block max-w-[120px] truncate transition-all duration-300 ${darktheme ? "text-gray-200 group-hover:text-white" : "text-gray-800 group-hover:text-gray-900"
                        }`}>
                        {user?.name?.split(' ')[0] || user?.name}
                      </span>

                      {/* Avatar */}
                      <Avatar className="w-9 h-9 ring-2 ring-blue-500/30 transition-all duration-300 group-hover:ring-blue-500/60 group-hover:ring-4">
                        <AvatarImage
                          src={user?.picture || usere?.picture || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`}
                          alt={user?.name}
                        />
                        <AvatarFallback className={`${darktheme ? "bg-blue-600" : "bg-blue-500"
                          } text-white font-semibold`}>
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Dropdown Icon */}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-180 ${darktheme ? "text-gray-400" : "text-gray-600"}`} />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent align="end" className={`w-56 ${darktheme
                    ? "bg-gray-800/95 border-gray-700"
                    : "bg-white/95 border-gray-200"
                    } backdrop-blur-lg`}>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className={`w-full justify-start ${darktheme
                          ? "border-gray-700 text-gray-200 hover:bg-gray-700 bg-gray-800"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        onClick={() => navigate("/profile")}
                      >
                        {t("navbar.viewProfile")}
                      </Button>
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleLogout}
                      >
                        {t("navbar.logout")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  onClick={() => loginWithRedirect()}
                  className={`px-6 py-2 rounded-xl font-semibold shadow-lg transition-all ${darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    } text-white`}
                >
                  {t("navbar.login")}
                </Button>
              )}
            </div>

            {/* Mobile Right Section */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Live Badge Mobile */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${darktheme
                ? "bg-green-500/10 border-green-500/30"
                : "bg-green-50 border-green-200"
                }`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-semibold ${darktheme ? "text-green-400" : "text-green-700"
                  }`}>
                  {t("navbar.liveTracking")}
                </span>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-xl border transition-all mobile-menu-container ${darktheme
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {isMobileMenuOpen ? (
                  <X className={`w-6 h-6 ${darktheme ? "text-gray-300" : "text-gray-700"}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${darktheme ? "text-gray-300" : "text-gray-700"}`} />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden mobile-menu-container border-t ${darktheme
            ? "bg-gray-900/98 border-gray-800"
            : "bg-white/98 border-gray-200"
            } backdrop-blur-lg`}>
            <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* Navigation Links */}
              <nav className="space-y-2">
                {[
                  { path: "/", label: t("navbar.home") },
                  ...(usere?.status === "driver" ? [{ path: "/Bus", label: t("navbar.busDetails") }] : []),
                  { path: "/view/map", label: t("navbar.map") },
                  { path: "/find/ticket", label: t("navbar.ticket") },
                  { path: "/nearBy/search", label: t("navbar.nearBy") },
                  { path: "/see-history", label: t("navbar.history") },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActiveRoute(item.path)
                      ? darktheme
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-blue-100 text-blue-700"
                      : darktheme
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Language Selector */}
              <div className={`p-4 rounded-xl border ${darktheme ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className={`w-4 h-4 ${darktheme ? "text-blue-400" : "text-blue-600"}`} />
                  <span className={`text-sm font-semibold ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                    Language
                  </span>
                </div>
                <select
                  value={selectedLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${darktheme
                    ? "bg-gray-900 border-gray-700 text-gray-200"
                    : "bg-white border-gray-200 text-gray-700"
                    }`}
                >
                  {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                    <option key={code} value={code}>
                      {flag} {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Toggle Mobile */}
              <div className={`p-4 rounded-xl border ${darktheme ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                <ThemeToggle />
              </div>

              {/* Authentication */}
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${darktheme ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}>
                    <div className="flex-1 flex items-center gap-2">
                      <span className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                        Hi,
                      </span>
                      <span className={`font-semibold ${darktheme ? "text-gray-200" : "text-gray-800"}`}>
                        {user?.name?.split(' ')[0] || user?.name}
                      </span>
                    </div>
                    <Avatar className="w-12 h-12 ring-2 ring-blue-500/30">
                      <AvatarImage
                        src={user?.picture || usere?.picture || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`}
                        alt={user?.name}
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Button
                    variant="outline"
                    className={`w-full ${darktheme
                      ? "border-gray-700 text-gray-200 hover:bg-gray-800 bg-gray-900"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.viewProfile")}
                  </Button>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
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
                  className={`w-full py-3 rounded-xl font-semibold shadow-lg ${darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    } text-white`}
                >
                  {t("navbar.login")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;