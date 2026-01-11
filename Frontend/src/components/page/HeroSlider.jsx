import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const HeroSlider = ({ children }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { darktheme } = useSelector((store) => store.auth);

    const images = [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&auto=format&fit=crop&q=80", // Modern bus interior
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1600&auto=format&fit=crop&q=80", // City bus at night
        "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=1600&auto=format&fit=crop&q=80", // Bus on road
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1600&auto=format&fit=crop&q=80"  // Urban transport
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Background Slides */}
            {images.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                    style={{
                        zIndex: 1
                    }}
                >
                    <img
                        src={img}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay to ensure text readability */}
                    <div
                        className={`absolute inset-0 ${darktheme
                                ? "bg-gray-900/70" // Dark overlay for dark theme
                                : "bg-blue-900/40" // Light blue overlay for light theme
                            }`}
                    ></div>
                </div>
            ))}

            {/* Content Overlay */}
            <div
                className="relative z-10 w-full min-h-screen flex flex-col"
            >
                {children}
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? (darktheme ? "bg-blue-400 w-8" : "bg-white w-8")
                                : (darktheme ? "bg-gray-600 hover:bg-gray-500" : "bg-white/50 hover:bg-white/80")
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
