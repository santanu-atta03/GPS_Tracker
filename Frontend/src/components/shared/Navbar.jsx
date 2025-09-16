import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigation } from "lucide-react";

const Navbar = () => {
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();

  return (
    <div className="w-full bg-white shadow-md px-6 py-2">
  <header className="max-w-maxContent w-10/12 mx-auto flex justify-between items-center">
    
    {/* Logo & App Name (Left Side) */}
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
        <Navigation className="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
          BusTracker Pro
        </h1>
        <p className="text-gray-600 text-sm">Real-time bus tracking system</p>
      </div>
    </div>

    {/* Live Tracking + Auth (Right Side) */}
    <div className="flex items-center gap-4">
      <div className="flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-green-700">Live Tracking Active</span>
      </div>

      {isAuthenticated ? (
        <>
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-gray-800 font-medium">{user?.name}</span>
          <Button
            onClick={() => logout({ returnTo: window.location.origin })}
            variant="destructive"
          >
            Logout
          </Button>
        </>
      ) : (
        <Button onClick={() => loginWithRedirect()}>Login</Button>
      )}
    </div>
  </header>
</div>

  );
};

export default Navbar;
