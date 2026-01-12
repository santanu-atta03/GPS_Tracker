import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import ChatBot from "../shared/ChatBot";
import {
    Phone,
    Mail,
    MessageCircle,
    Bot,
    Clock,
    Send,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    FileText,
    Headphones,
} from "lucide-react";

const HelpSupport = () => {
    const { darktheme } = useSelector((store) => store.auth);
    const navigate = useNavigate();
    const [showChatBot, setShowChatBot] = useState(false);
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const contactOptions = [
        {
            icon: Phone,
            title: "24/7 Call Support",
            description: "Talk to our support team anytime",
            action: "tel:+18002874357",
            actionText: "+1-800-BUS-HELP",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Mail,
            title: "Email Support",
            description: "Get help via email within 24 hours",
            action: "mailto:support@whereismybus.com",
            actionText: "support@whereismybus.com",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Bot,
            title: "AI Customer Support",
            description: "Instant answers from our AI assistant",
            action: () => setShowChatBot(true),
            actionText: "Start Chat",
            color: "from-purple-500 to-pink-500",
        },
    ];

    const faqs = [
        {
            question: "How do I track my bus in real-time?",
            answer:
                "Go to the 'Live Tracking' page from the sidebar menu. You'll see all available buses on an interactive map with their current locations and routes.",
        },
        {
            question: "How can I book a ticket?",
            answer:
                "Navigate to the 'Tickets' section, search for your desired route, select your bus, choose your seat, and proceed with payment. You'll receive a QR code ticket instantly.",
        },
        {
            question: "What payment methods do you accept?",
            answer:
                "We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure Razorpay integration.",
        },
        {
            question: "Can I cancel or modify my ticket?",
            answer:
                "Yes, you can cancel your ticket up to 2 hours before departure for a full refund. Modifications can be made up to 1 hour before departure.",
        },
        {
            question: "How do I find nearby bus stops?",
            answer:
                "Use the 'Nearby Buses' feature from the menu. It will show all bus stops near your current location using GPS.",
        },
        {
            question: "Is my personal data secure?",
            answer:
                "Absolutely! We use industry-standard encryption and never share your personal information with third parties. Read our Privacy Policy for more details.",
        },
    ];

    const socialLinks = [
        { icon: Facebook, name: "Facebook", url: "#", color: "hover:text-blue-600" },
        { icon: Twitter, name: "Twitter", url: "#", color: "hover:text-sky-500" },
        { icon: Instagram, name: "Instagram", url: "#", color: "hover:text-pink-600" },
        { icon: Linkedin, name: "LinkedIn", url: "#", color: "hover:text-blue-700" },
    ];

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        alert("Support ticket submitted! We'll get back to you within 24 hours.");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className={`min-h-screen ${darktheme ? "bg-gray-950" : "bg-gray-50"}`}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
                        <HelpCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1
                        className={`text-4xl md:text-5xl font-bold mb-4 ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        How Can We Help You?
                    </h1>
                    <p
                        className={`text-lg ${darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        We're here 24/7 to assist you with any questions or concerns
                    </p>
                </div>

                {/* Contact Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {contactOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                            <div
                                key={index}
                                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${darktheme
                                    ? "bg-gray-900 border border-gray-800"
                                    : "bg-white border border-gray-200"
                                    }`}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                                ></div>
                                <div className="relative z-10">
                                    <div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3
                                        className={`text-lg font-semibold mb-2 ${darktheme ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {option.title}
                                    </h3>
                                    <p
                                        className={`text-sm mb-4 ${darktheme ? "text-gray-400" : "text-gray-600"
                                            }`}
                                    >
                                        {option.description}
                                    </p>
                                    {typeof option.action === "function" ? (
                                        <button
                                            onClick={option.action}
                                            className={`text-sm font-semibold bg-gradient-to-r ${option.color} bg-clip-text text-transparent hover:underline`}
                                        >
                                            {option.actionText} →
                                        </button>
                                    ) : (
                                        <a
                                            href={option.action}
                                            className={`text-sm font-semibold bg-gradient-to-r ${option.color} bg-clip-text text-transparent hover:underline`}
                                        >
                                            {option.actionText} →
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <h2
                            className={`text-3xl font-bold mb-2 ${darktheme ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Frequently Asked Questions
                        </h2>
                        <p
                            className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}
                        >
                            Find quick answers to common questions
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`rounded-xl border overflow-hidden transition-all ${darktheme
                                    ? "bg-gray-900 border-gray-800"
                                    : "bg-white border-gray-200"
                                    }`}
                            >
                                <button
                                    onClick={() =>
                                        setExpandedFAQ(expandedFAQ === index ? null : index)
                                    }
                                    className={`w-full flex items-center justify-between p-6 text-left transition-colors ${darktheme ? "hover:bg-gray-800" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <span
                                        className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {faq.question}
                                    </span>
                                    {expandedFAQ === index ? (
                                        <ChevronUp
                                            className={`w-5 h-5 ${darktheme ? "text-gray-400" : "text-gray-600"
                                                }`}
                                        />
                                    ) : (
                                        <ChevronDown
                                            className={`w-5 h-5 ${darktheme ? "text-gray-400" : "text-gray-600"
                                                }`}
                                        />
                                    )}
                                </button>
                                {expandedFAQ === index && (
                                    <div
                                        className={`px-6 pb-6 ${darktheme ? "text-gray-400" : "text-gray-600"
                                            }`}
                                    >
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Ticket Form */}
                <div className="max-w-2xl mx-auto mb-16">
                    <div className="text-center mb-8">
                        <h2
                            className={`text-3xl font-bold mb-2 ${darktheme ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Submit a Support Ticket
                        </h2>
                        <p
                            className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}
                        >
                            Can't find what you're looking for? Send us a message
                        </p>
                    </div>

                    <form
                        onSubmit={handleFormSubmit}
                        className={`rounded-2xl p-8 ${darktheme
                            ? "bg-gray-900 border border-gray-800"
                            : "bg-white border border-gray-200"
                            }`}
                    >
                        <div className="space-y-6">
                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                                        }`}
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darktheme
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                                        }`}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    required
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darktheme
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                                        }`}
                                >
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) =>
                                        setFormData({ ...formData, subject: e.target.value })
                                    }
                                    required
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darktheme
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                    placeholder="Brief description of your issue"
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                                        }`}
                                >
                                    Message
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({ ...formData, message: e.target.value })
                                    }
                                    required
                                    rows={6}
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${darktheme
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                    placeholder="Describe your issue in detail..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>

                {/* Social Media Links */}
                <div className="text-center">
                    <h3
                        className={`text-2xl font-bold mb-6 ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Connect With Us
                    </h3>
                    <div className="flex justify-center gap-4">
                        {socialLinks.map((social, index) => {
                            const Icon = social.icon;
                            return (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${darktheme
                                        ? "bg-gray-900 border border-gray-800 text-gray-400"
                                        : "bg-white border border-gray-200 text-gray-600"
                                        } ${social.color}`}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ChatBot Widget */}
            {showChatBot && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        <ChatBot
                            isOpenFromHelp={true}
                            onClose={() => setShowChatBot(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpSupport;
