import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../shared/Navbar";
import {
    MapPin,
    Users,
    Clock,
    Shield,
    Zap,
    Heart,
    Award,
    TrendingUp,
    CheckCircle,
    Navigation,
    Smartphone,
    Globe,
} from "lucide-react";

const About = () => {
    const { darktheme } = useSelector((store) => store.auth);

    const features = [
        {
            icon: MapPin,
            title: "Real-Time Tracking",
            description: "Track buses in real-time with GPS precision and live updates",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Smartphone,
            title: "Easy Booking",
            description: "Book tickets instantly with our user-friendly mobile interface",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Clock,
            title: "24/7 Availability",
            description: "Access our services anytime, anywhere with round-the-clock support",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Shield,
            title: "Secure Payments",
            description: "Safe and encrypted payment processing with multiple options",
            color: "from-orange-500 to-red-500",
        },
        {
            icon: Zap,
            title: "Instant Updates",
            description: "Get real-time notifications about your bus arrival and delays",
            color: "from-yellow-500 to-orange-500",
        },
        {
            icon: Globe,
            title: "Multi-Language",
            description: "Support for 18+ Indian languages for better accessibility",
            color: "from-indigo-500 to-purple-500",
        },
    ];

    const stats = [
        { number: "50K+", label: "Active Users", icon: Users },
        { number: "1000+", label: "Buses Tracked", icon: Navigation },
        { number: "99.9%", label: "Uptime", icon: TrendingUp },
        { number: "24/7", label: "Support", icon: Clock },
    ];

    const values = [
        {
            icon: Heart,
            title: "Customer First",
            description: "We prioritize user experience and satisfaction above all else",
        },
        {
            icon: Shield,
            title: "Trust & Security",
            description: "Your data and privacy are protected with industry-leading security",
        },
        {
            icon: Award,
            title: "Innovation",
            description: "Constantly improving with cutting-edge technology and AI integration",
        },
        {
            icon: CheckCircle,
            title: "Reliability",
            description: "Consistent, accurate tracking you can depend on every day",
        },
    ];

    return (
        <div className={`min-h-screen ${darktheme ? "bg-gray-950" : "bg-gray-50"}`}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6 animate-pulse">
                        <Navigation className="w-10 h-10 text-white" />
                    </div>
                    <h1
                        className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${darktheme ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
                            } bg-clip-text text-transparent`}
                    >
                        About Where is My Bus
                    </h1>
                    <p
                        className={`text-lg max-w-3xl mx-auto ${darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        Revolutionizing public transportation with real-time GPS tracking, making
                        your daily commute smarter, safer, and more efficient.
                    </p>
                </div>

                {/* Mission Statement */}
                <div
                    className={`rounded-2xl p-8 md:p-12 mb-16 ${darktheme
                            ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-gray-800"
                            : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                        }`}
                >
                    <h2
                        className={`text-3xl font-bold mb-4 text-center ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Our Mission
                    </h2>
                    <p
                        className={`text-lg text-center max-w-4xl mx-auto ${darktheme ? "text-gray-300" : "text-gray-700"
                            }`}
                    >
                        To transform the way people experience public transportation by providing
                        real-time, accurate bus tracking and seamless ticketing solutions. We
                        believe everyone deserves a stress-free commute with complete visibility
                        into their journey.
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className={`text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${darktheme
                                        ? "bg-gray-900 border border-gray-800"
                                        : "bg-white border border-gray-200"
                                    }`}
                            >
                                <Icon
                                    className={`w-8 h-8 mx-auto mb-3 ${darktheme ? "text-blue-400" : "text-blue-600"
                                        }`}
                                />
                                <div
                                    className={`text-3xl font-bold mb-2 bg-gradient-to-r ${darktheme ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
                                        } bg-clip-text text-transparent`}
                                >
                                    {stat.number}
                                </div>
                                <div
                                    className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Features Grid */}
                <div className="mb-16">
                    <h2
                        className={`text-3xl font-bold mb-8 text-center ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        What We Offer
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${darktheme
                                            ? "bg-gray-900 border border-gray-800"
                                            : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3
                                        className={`text-xl font-semibold mb-2 ${darktheme ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p
                                        className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}
                                    >
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Core Values */}
                <div className="mb-16">
                    <h2
                        className={`text-3xl font-bold mb-8 text-center ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Our Core Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className={`text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${darktheme
                                            ? "bg-gray-900 border border-gray-800"
                                            : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <div
                                        className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${darktheme
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600"
                                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                                            }`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3
                                        className={`text-lg font-semibold mb-2 ${darktheme ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {value.title}
                                    </h3>
                                    <p
                                        className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"
                                            }`}
                                    >
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Technology Stack */}
                <div
                    className={`rounded-2xl p-8 md:p-12 mb-16 ${darktheme
                            ? "bg-gray-900 border border-gray-800"
                            : "bg-white border border-gray-200"
                        }`}
                >
                    <h2
                        className={`text-3xl font-bold mb-6 text-center ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Powered by Advanced Technology
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            "Real-Time GPS",
                            "AI Chatbot",
                            "Cloud Infrastructure",
                            "Secure Payments",
                            "Multi-Language",
                            "Mobile Responsive",
                            "Live Notifications",
                            "Data Analytics",
                        ].map((tech, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-2 p-3 rounded-lg ${darktheme ? "bg-gray-800" : "bg-gray-50"
                                    }`}
                            >
                                <CheckCircle
                                    className={`w-5 h-5 ${darktheme ? "text-green-400" : "text-green-600"
                                        }`}
                                />
                                <span
                                    className={`text-sm font-medium ${darktheme ? "text-gray-300" : "text-gray-700"
                                        }`}
                                >
                                    {tech}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <h2
                        className={`text-3xl font-bold mb-4 ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Join Thousands of Happy Commuters
                    </h2>
                    <p
                        className={`text-lg mb-8 ${darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        Experience the future of public transportation today
                    </p>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                    >
                        Get Started Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default About;
