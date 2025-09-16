import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();

  return (
    <div className="flex justify-between items-center bg-gray-800 px-6 py-3 text-white">
      {/* Logo */}
      <div className="text-xl font-bold">MyApp</div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{user?.name}</span>
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
    </div>
  );
};

export default Navbar;
