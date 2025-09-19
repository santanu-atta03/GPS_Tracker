import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigation, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();
  const { usere } = useSelector((store) => store.auth);

  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );

  const LANGUAGES = {
    en: { name: 'English', flag: '🇺🇸' },
    hi: { name: 'हिंदी', flag: '🇮🇳' },
    ta: { name: 'தமிழ்', flag: '🇮🇳' },
    te: { name: 'తెలుగు', flag: '🇮🇳' },
    kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    ml: { name: 'മലയാളം', flag: '🇮🇳' },
    bn: { name: 'বাংলা', flag: '🇧🇩' },
    gu: { name: 'ગુજરાતી', flag: '🇮🇳' },
    mr: { name: 'मराठी', flag: '🇮🇳' },
    pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    ur: { name: 'اردو', flag: '🇵🇰' }
  };

  // Simple language change function

  const handleLanguageChange = (langCode) => {
  if (!langCode) return;

  const currentLang = localStorage.getItem('selectedLanguage');
  if (currentLang === langCode) return; // Avoid re-setting the same language

  setSelectedLang(langCode);
  localStorage.setItem('selectedLanguage', langCode);

  const interval = setInterval(() => {
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = langCode;
      googleSelect.dispatchEvent(new Event('change'));
      clearInterval(interval);
    }
  }, 500);

  // Stop trying after 5 seconds
  setTimeout(() => clearInterval(interval), 5000);
};

  // const handleLanguageChange = (langCode) => {
  //   console.log('Changing language to:', langCode);
    
  //   setSelectedLang(langCode);
  //   localStorage.setItem('selectedLanguage', langCode);

  //   // Method 1: Try to find the Google Translate dropdown
  //   setTimeout(() => {
  //     const googleSelect = document.querySelector('.goog-te-combo');
  //     if (googleSelect) {
  //       console.log('Found Google Translate dropdown');
  //       googleSelect.value = langCode;
  //       googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
  //     } else {
  //       console.log('Google Translate dropdown not found, trying alternative method');
  //       // Method 2: Trigger translation by manipulating the URL hash
  //       const currentUrl = window.location.href;
  //       const baseUrl = currentUrl.split('#')[0];
  //       window.location.href = baseUrl + '#googtrans(en|' + langCode + ')';
  //       window.location.reload();
  //     }
  //   }, 500);
  // };

  // Restore language on page load
  useEffect(() => {
  const savedLang = localStorage.getItem('selectedLanguage');
  if (savedLang && savedLang !== 'en') {
    setTimeout(() => {
      handleLanguageChange(savedLang);
    }, 2000);
  }
}, []);


  return (
    <div className="w-full bg-white/80 backdrop-blur-md shadow-lg border-b border-green-100 px-6 py-3">
      <header className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & App Name */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Navigation className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              BusTracker Pro
            </h1>
            <p className="text-gray-600 text-sm">
              Real-time bus tracking system
            </p>
          </div>
        </div>

        {/* Right Side: Navigation + Language + Live Tracking + Auth */}
        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </div>
            <div
              onClick={() => navigate("/Bus")}
              className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              Bus Details
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </div>
            <div
              onClick={() => navigate("/view/map")}
              className="cursor-pointer font-semibold text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              Map
              <span className="absolute -bottom-1 left-0 w-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </div>
          </div>

          {/* Simple Language Selector */}
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

          {/* Live Tracking Badge */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full px-4 py-2 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">
              Live Tracking Active
            </span>
          </div>

          {/* Authentication */}
          {isAuthenticated ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center cursor-pointer space-x-3 bg-white/50 rounded-full px-3 py-2 hover:bg-white/80 transition-all duration-200 border border-gray-200 hover:border-green-200">
                  {user?.picture ? (
                    <Avatar className="w-10 h-10 border-2 border-green-200 hover:border-green-400 transition-all duration-300">
                      <AvatarImage
                        src={
                          user?.picture ||
                          usere?.picture ||
                          `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
                        }
                        alt={user.name}
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
                  <span className="text-gray-800 font-medium hidden sm:block">
                    {user?.name}
                  </span>
                </div>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-48 bg-white/95 backdrop-blur-md border border-green-100 shadow-xl">
                <Button
                  variant="outline"
                  className="w-full mb-2 border-green-200 text-gray-700 hover:bg-green-50 hover:border-green-300"
                  onClick={() => navigate("/profile")}
                >
                  View Profile
                </Button>
                <Button
                  variant="destructive"
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Logout
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <Button 
              onClick={() => loginWithRedirect()}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Login
            </Button>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;