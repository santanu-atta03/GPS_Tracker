import { useDispatch, useSelector } from "react-redux";
import { setdarktheme } from "@/Redux/auth.reducer";

export function ThemeToggle() {
  const dispatch = useDispatch();
  const { darktheme } = useSelector((store) => store.auth);

  const handleThemeChange = () => {
    dispatch(setdarktheme(!darktheme));
  };

  return (
    <button
      onClick={handleThemeChange}
      className="relative w-24 h-12 rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all duration-300 hover:scale-105 shadow-xl"
      aria-label="Toggle theme"
      style={{
        boxShadow: darktheme 
          ? '0 8px 32px rgba(30, 41, 59, 0.5)' 
          : '0 8px 32px rgba(135, 206, 235, 0.4)'
      }}
    >
      {/* Background - Sky/Night transition */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          darktheme
            ? "bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-800"
            : "bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200"
        }`}
      />

      {/* Stars (dark mode only) with twinkling effect */}
      {darktheme && (
        <>
          <div className="absolute top-2 left-6 w-1 h-1 bg-white rounded-full animate-pulse" 
               style={{animationDuration: '1.5s'}} />
          <div className="absolute top-3 left-10 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse" 
               style={{animationDuration: '2s', animationDelay: '0.3s'}} />
          <div className="absolute top-2.5 right-8 w-0.5 h-0.5 bg-white rounded-full animate-pulse" 
               style={{animationDuration: '1.8s', animationDelay: '0.6s'}} />
          <div className="absolute top-3.5 right-12 w-1 h-1 bg-yellow-100 rounded-full animate-pulse" 
               style={{animationDuration: '2.2s', animationDelay: '0.9s'}} />
          {/* Shooting star */}
          <div className="absolute top-1 right-10 w-4 h-0.5 bg-gradient-to-r from-white to-transparent rounded-full opacity-70 animate-pulse"
               style={{transform: 'rotate(-30deg)', animationDuration: '3s'}} />
        </>
      )}

      {/* Clouds (light mode only) */}
      {!darktheme && (
        <>
          <div className="absolute top-2 left-8 w-8 h-2 bg-white/60 rounded-full blur-sm" />
          <div className="absolute top-2.5 left-10 w-6 h-1.5 bg-white/50 rounded-full blur-sm" />
          <div className="absolute top-1.5 right-10 w-6 h-2 bg-white/60 rounded-full blur-sm" />
        </>
      )}

      {/* Ground/Landscape with enhanced details */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-5 transition-all duration-700 ${
          darktheme
            ? "bg-gradient-to-b from-green-900 via-green-950 to-slate-900"
            : "bg-gradient-to-b from-green-500 via-green-600 to-green-700"
        }`}
      >
        {/* Hills with more detail */}
        <div
          className={`absolute bottom-0 -left-2 w-10 h-4 rounded-t-full transition-colors duration-700 ${
            darktheme ? "bg-green-800/80" : "bg-green-400/80"
          }`}
        />
        <div
          className={`absolute bottom-0 left-6 w-8 h-3 rounded-t-full transition-colors duration-700 ${
            darktheme ? "bg-green-800/60" : "bg-green-400/60"
          }`}
        />
        <div
          className={`absolute bottom-0 right-8 w-6 h-2.5 rounded-t-full transition-colors duration-700 ${
            darktheme ? "bg-green-800/70" : "bg-green-400/70"
          }`}
        />
      </div>

      {/* Enhanced Tree */}
      <div className="absolute bottom-5 right-4">
        {/* Trunk */}
        <div
          className={`w-1.5 h-3 rounded-sm transition-colors duration-700 mx-auto ${
            darktheme ? "bg-amber-900" : "bg-amber-800"
          }`}
        />
        {/* Leaves - layered for depth */}
        <div
          className={`absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full transition-colors duration-700 ${
            darktheme ? "bg-green-800" : "bg-green-600"
          }`}
        />
        <div
          className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-colors duration-700 ${
            darktheme ? "bg-green-700" : "bg-green-500"
          }`}
        />
      </div>

      {/* Sun (light mode) with rays */}
      <div
        className={`absolute top-3 right-8 transition-all duration-700 ${
          !darktheme
            ? "opacity-100 scale-100"
            : "opacity-0 scale-0"
        }`}
      >
        {/* Sun rays */}
        <div className="absolute inset-0 animate-spin" style={{animationDuration: '20s'}}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
            <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-yellow-300/50 rounded-full -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 w-0.5 h-1.5 bg-yellow-300/50 rounded-full -translate-x-1/2" />
            <div className="absolute left-0 top-1/2 w-1.5 h-0.5 bg-yellow-300/50 rounded-full -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 w-1.5 h-0.5 bg-yellow-300/50 rounded-full -translate-y-1/2" />
          </div>
        </div>
        {/* Sun circle */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-lg shadow-yellow-300/60" />
      </div>

      {/* Moon (dark mode) with enhanced craters */}
      <div
        className={`absolute top-2 left-6 w-5 h-5 rounded-full transition-all duration-700 ${
          darktheme
            ? "bg-gradient-to-br from-slate-200 to-slate-300 opacity-100 scale-100 shadow-lg shadow-slate-400/50"
            : "bg-slate-300 opacity-0 scale-0"
        }`}
      >
        {/* Moon craters with more detail */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-slate-400 rounded-full opacity-40" />
        <div className="absolute top-2 right-1 w-1 h-1 bg-slate-400 rounded-full opacity-30" />
        <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-slate-400 rounded-full opacity-50" />
      </div>

      {/* Sliding Toggle Circle with gradient */}
      <div
        className={`absolute top-1.5 w-9 h-9 rounded-full shadow-2xl transition-all duration-700 ease-in-out ${
          darktheme 
            ? "left-1.5 bg-gradient-to-br from-slate-100 to-slate-200" 
            : "left-[calc(100%-2.75rem)] bg-gradient-to-br from-white to-gray-50"
        }`}
        style={{
          boxShadow: darktheme
            ? '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
        }}
      >
        {/* Icon on toggle */}
        <div className="absolute inset-0 flex items-center justify-center">
          {darktheme ? (
            <svg className="w-5 h-5 text-indigo-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}