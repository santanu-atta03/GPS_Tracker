import React from "react";
import { useSelector } from "react-redux";
import {
    Brain,
    Target,
    CloudRain,
    Shield,
    RotateCcw,
    Sparkles,
    TrendingUp,
} from "lucide-react";

const UniqueFeatures = () => {
    const { darktheme } = useSelector((store) => store.auth);

    const features = [
        {
            icon: Brain,
            title: "Missed Bus Intelligence",
            description: "Never miss your bus again! Get instant notifications if you just missed a bus with the exact time difference.",
            example: '"You missed Bus 12A by 2 mins"',
            benefit: "Auto-suggests next best bus",
            color: "from-purple-500 to-pink-500",
            badge: "AI-Powered",
        },
        {
            icon: Target,
            title: "Smart Boarding Zone",
            description: "Know exactly where to stand at the bus stop for faster boarding based on bus direction and door position.",
            example: '"Stand 20m ahead for faster boarding"',
            benefit: "Save time & board efficiently",
            color: "from-blue-500 to-cyan-500",
            badge: "Location-Based",
        },
        {
            icon: CloudRain,
            title: "Weather-Aware ETA",
            description: "ETA automatically adjusts based on real-time weather conditions like rain, fog, or extreme heat.",
            example: '"ETA increased by 5 mins due to heavy rain"',
            benefit: "More accurate arrival times",
            color: "from-orange-500 to-yellow-500",
            badge: "Smart Prediction",
        },
        {
            icon: Shield,
            title: "Safety Heatmap",
            description: "Anonymous aggregated data shows safer bus routes and zones based on time of day and crowd patterns.",
            example: '"Safer route highlighted for night travel"',
            benefit: "Travel with confidence",
            color: "from-green-500 to-emerald-500",
            badge: "Privacy-First",
        },
        {
            icon: RotateCcw,
            title: "Reverse Tracking",
            description: "Already on the bus? Track your journey in real-time with upcoming stops and exact arrival times at your destination.",
            example: '"Next stop: Central Station in 3 mins"',
            benefit: "Perfect for onboard passengers",
            color: "from-indigo-500 to-purple-500",
            badge: "Passenger Mode",
        },
    ];

    return (
        <div
            className={`py-20 ${darktheme ? "bg-gray-950" : "bg-gradient-to-b from-gray-50 to-white"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold text-sm">
                            Next-Level Innovation
                        </span>
                    </div>
                    <h2
                        className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${darktheme
                            ? "from-blue-400 to-purple-400"
                            : "from-blue-600 to-purple-600"
                            } bg-clip-text text-transparent`}
                    >
                        Unique Features That Set Us Apart
                    </h2>
                    <p
                        className={`text-lg max-w-3xl mx-auto ${darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        Revolutionizing your daily commute with intelligent features that
                        solve real-world travel challenges using advanced technology
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {features.slice(0, 3).map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${darktheme
                                    ? "bg-gray-900/50 border border-gray-800 hover:border-gray-700"
                                    : "bg-white border border-gray-200 hover:border-gray-300"
                                    } backdrop-blur-sm`}
                            >
                                {/* Gradient Background on Hover */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                                ></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Badge */}
                                    <div className="mb-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.color} text-white`}
                                        >
                                            <TrendingUp className="w-3 h-3" />
                                            {feature.badge}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3
                                        className={`text-2xl font-bold mb-3 ${darktheme ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p
                                        className={`text-sm mb-4 leading-relaxed ${darktheme ? "text-gray-400" : "text-gray-600"
                                            }`}
                                    >
                                        {feature.description}
                                    </p>

                                    {/* Example */}
                                    <div
                                        className={`p-3 rounded-lg mb-4 border-l-4 ${darktheme
                                            ? "bg-gray-800/50 border-purple-500"
                                            : "bg-gray-50 border-purple-400"
                                            }`}
                                    >
                                        <p
                                            className={`text-sm italic ${darktheme ? "text-gray-300" : "text-gray-700"
                                                }`}
                                        >
                                            {feature.example}
                                        </p>
                                    </div>

                                    {/* Benefit */}
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`}
                                        ></div>
                                        <span
                                            className={`text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                                        >
                                            {feature.benefit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Row - 2 Cards Centered */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {features.slice(3, 5).map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index + 3}
                                className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${darktheme
                                    ? "bg-gray-900/50 border border-gray-800 hover:border-gray-700"
                                    : "bg-white border border-gray-200 hover:border-gray-300"
                                    } backdrop-blur-sm`}
                            >
                                {/* Gradient Background on Hover */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                                ></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Badge */}
                                    <div className="mb-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.color} text-white`}
                                        >
                                            <TrendingUp className="w-3 h-3" />
                                            {feature.badge}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3
                                        className={`text-2xl font-bold mb-3 ${darktheme ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p
                                        className={`text-sm mb-4 leading-relaxed ${darktheme ? "text-gray-400" : "text-gray-600"
                                            }`}
                                    >
                                        {feature.description}
                                    </p>

                                    {/* Example */}
                                    <div
                                        className={`p-3 rounded-lg mb-4 border-l-4 ${darktheme
                                            ? "bg-gray-800/50 border-purple-500"
                                            : "bg-gray-50 border-purple-400"
                                            }`}
                                    >
                                        <p
                                            className={`text-sm italic ${darktheme ? "text-gray-300" : "text-gray-700"
                                                }`}
                                        >
                                            {feature.example}
                                        </p>
                                    </div>

                                    {/* Benefit */}
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`}
                                        ></div>
                                        <span
                                            className={`text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                                        >
                                            {feature.benefit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>


            </div>
        </div>
    );
};

export default UniqueFeatures;
