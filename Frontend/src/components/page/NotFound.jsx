import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Home, ArrowLeft, Navigation, Bus } from "lucide-react";
import Navbar from "../shared/Navbar";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="flex flex-col items-center justify-center px-4 py-16 md:py-24">
        {/* Animated GPS/Map Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 w-32 h-32 md:w-40 md:h-40"></div>
          <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-2 border-primary/20">
            <MapPin className="w-16 h-16 md:w-20 md:h-20 text-primary animate-bounce" />
          </div>

          {/* Floating decorative icons */}
          <Bus className="absolute -top-2 -right-4 w-8 h-8 text-muted-foreground/40 animate-pulse" />
          <Navigation
            className="absolute -bottom-2 -left-4 w-6 h-6 text-muted-foreground/40 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Error Code */}
        <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 mb-4">
          404
        </h1>

        {/* Main Card */}
        <Card className="max-w-md w-full mx-auto shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 text-center">
            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Page Not Found
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mb-2">
              Oops! It looks like you've taken a wrong turn.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-8">
              The page you're looking for doesn't exist or has been moved. Don't
              worry, let us help you get back on track!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/">
                  <Home className="w-5 h-5" />
                  Go to Home
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleGoBack}
                className="gap-2 hover:bg-accent/50 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Links Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Or try one of these helpful links:
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              to="/Bus"
              className="text-primary hover:underline underline-offset-4 transition-colors"
            >
              Find a Bus
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link
              to="/find/ticket"
              className="text-primary hover:underline underline-offset-4 transition-colors"
            >
              My Tickets
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link
              to="/Suport-chat-bot"
              className="text-primary hover:underline underline-offset-4 transition-colors"
            >
              Support
            </Link>
          </div>
        </div>

        {/* Decorative Map Pattern (background element) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5 dark:opacity-10 pointer-events-none overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20 Q 25 5, 50 15 T 100 10 L 100 20 Z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
