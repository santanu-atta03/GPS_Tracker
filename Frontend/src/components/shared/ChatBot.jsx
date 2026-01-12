import React, { useState } from "react";
import { useSelector } from "react-redux";
import { X, Send, Bot, Minimize2, MessageCircle } from "lucide-react";

const ChatBot = ({ isOpenFromHelp = false, onClose = null }) => {
    const [isOpen, setIsOpen] = useState(isOpenFromHelp);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI support assistant. How can I help you today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const { darktheme } = useSelector((store) => store.auth);

    const quickActions = [
        "Track my bus",
        "Book a ticket",
        "View my tickets",
        "Report an issue",
    ];

    const botResponses = {
        "track my bus": "To track your bus, please go to the 'Live Tracking' page from the menu. You can see all buses in real-time on the map!",
        "book a ticket": "You can book a ticket by going to the 'Tickets' section. Search for your route and select your preferred bus.",
        "view my tickets": "Your tickets are available in the 'My Tickets' section. You can access it from the sidebar menu.",
        "report an issue": "I'm sorry to hear you're having an issue. Please describe your problem and I'll do my best to help you.",
        default: "I understand you need help. Could you please provide more details? You can also contact our 24/7 support at +1-800-BUS-HELP or email us at support@whereismybus.com",
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: inputMessage,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages([...messages, userMessage]);
        setInputMessage("");
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const lowerInput = inputMessage.toLowerCase();
            let botResponse = botResponses.default;

            for (const [key, value] of Object.entries(botResponses)) {
                if (lowerInput.includes(key)) {
                    botResponse = value;
                    break;
                }
            }

            const botMessage = {
                id: messages.length + 2,
                text: botResponse,
                sender: "bot",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleQuickAction = (action) => {
        setInputMessage(action);
        setTimeout(() => handleSendMessage(), 100);
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setIsOpen(false);
        }
    };

    if (!isOpen && !isOpenFromHelp) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${darktheme
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    }`}
            >
                <MessageCircle className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </button>
        );
    }

    return (
        <div
            className={`fixed ${isOpenFromHelp ? "inset-0 z-40" : "bottom-6 right-6 z-50"
                } ${isOpenFromHelp ? "md:relative md:w-full md:h-[600px]" : ""}`}
        >
            <div
                className={`${isOpenFromHelp
                        ? "w-full h-full"
                        : "w-full sm:w-96 h-[600px] max-h-[80vh]"
                    } flex flex-col rounded-2xl shadow-2xl overflow-hidden ${darktheme ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
                    }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-4 ${darktheme
                            ? "bg-gradient-to-r from-blue-600 to-purple-600"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">AI Support</h3>
                            <p className="text-white/80 text-xs">Online • Instant replies</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-white/20 transition-all"
                    >
                        {isOpenFromHelp ? (
                            <Minimize2 className="w-5 h-5 text-white" />
                        ) : (
                            <X className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === "user"
                                        ? darktheme
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                            : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                        : darktheme
                                            ? "bg-gray-800 text-gray-200"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p
                                    className={`text-xs mt-1 ${message.sender === "user"
                                            ? "text-white/70"
                                            : darktheme
                                                ? "text-gray-500"
                                                : "text-gray-500"
                                        }`}
                                >
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div
                                className={`rounded-2xl px-4 py-2 ${darktheme ? "bg-gray-800" : "bg-gray-100"
                                    }`}
                            >
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                    <div className="px-4 pb-2">
                        <p
                            className={`text-xs mb-2 ${darktheme ? "text-gray-400" : "text-gray-600"
                                }`}
                        >
                            Quick actions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${darktheme
                                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div
                    className={`p-4 border-t ${darktheme ? "border-gray-800" : "border-gray-200"
                        }`}
                >
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Type your message..."
                            className={`flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darktheme
                                    ? "bg-gray-800 border-gray-700 text-gray-200"
                                    : "bg-white border-gray-200 text-gray-800"
                                }`}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            className={`p-2 rounded-xl transition-all ${inputMessage.trim()
                                    ? darktheme
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                    : darktheme
                                        ? "bg-gray-800 cursor-not-allowed"
                                        : "bg-gray-200 cursor-not-allowed"
                                }`}
                        >
                            <Send
                                className={`w-5 h-5 ${inputMessage.trim() ? "text-white" : "text-gray-400"
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
