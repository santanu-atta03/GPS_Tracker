import React, { useState } from "react";
import axios from "axios";
import { MessageCircle, Send, Bot, User } from "lucide-react";

const SupportChat = () => {
  // Initialize with a greeting message from the bot
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/support/ask`, { question: input });
      const botMsg = { sender: "bot", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Try again later." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-xl rounded-2xl border border-green-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Customer Support</h3>
          <p className="text-xs text-green-50">We're here to help</p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 bg-gradient-to-br from-green-50 via-white to-green-50">
        {messages.map((m, i) => (
          <div key={i} className={`mb-4 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-start gap-2 max-w-[80%] ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.sender === "user" 
                  ? "bg-gradient-to-br from-green-500 to-green-600" 
                  : "bg-gray-200"
              }`}>
                {m.sender === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              
              {/* Message bubble */}
              <div
                className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex border-t border-green-100 bg-white p-3 gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-grow px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 placeholder-gray-400 transition-all duration-300"
        />
        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SupportChat;