import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useDispatch, useSelector } from "react-redux";
import { setdarktheme } from "@/Redux/auth.reducer";
import { useState } from "react";

export function ThemeToggle() {
  const dispatch = useDispatch();

  const { darktheme } = useSelector((store) => store.auth);
  const handelthemechange = () => {
    dispatch(setdarktheme(!darktheme));
  };
  return (
    <Button
      variant="outline"
      size="icon"
      className={`relative ${!darktheme}? "bg-white" : " bg-black"`}
      onClick={handelthemechange}
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          !darktheme ? "-rotate-90 scale-0" : "rotate-0 scale-100 "
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          !darktheme ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
