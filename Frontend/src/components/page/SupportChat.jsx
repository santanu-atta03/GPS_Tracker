import React, { useState } from "react";
import axios from "axios";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useApiCall } from "../../hooks/useApiCall";

const SupportChat = () => {
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();

  // Initialize with a greeting message from the bot
  const [messages, setMessages] = useState([
    { sender: "bot", text: t("support.greeting") },
  ]);
  const [input, setInput] = useState("");

  // API hook for asking support bot
  const { loading: askingBot, execute: askBot } = useApiCall({
    apiFunction: (question) => 
      axios.post(`${import.meta.env.VITE_BASE_URL}/support/ask`, { question }),
    showSuccessToast: false,
    showErrorToast: false,
    onSuccess: (data) => {
      const botMsg = { sender: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMsg]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: t("support.errorMessage") },
      ]);
    }
  });

  const sendMessage = async () => {
    if (!input.trim() || askingBot) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const question = input;
    setInput("");

    await askBot(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 shadow-xl rounded-2xl border overflow-hidden ${
        darktheme ? "bg-gray-800 border-gray-700" : "bg-white border-green-100"
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{t("support.title")}</h3>
          <p className="text-xs text-green-50">{t("support.subtitle")}</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className={`h-80 overflow-y-auto p-4 ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-green-50 via-white to-green-50"
        }`}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-4 flex ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start gap-2 max-w-[80%] ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.sender === "user"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : darktheme
                    ? "bg-gray-700"
                    : "bg-gray-200"
                }`}
              >
                {m.sender === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot
                    className={`w-4 h-4 ${
                      darktheme ? "text-gray-300" : "text-gray-600"
                    }`}
                  />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white rounded-tr-sm"
                    : darktheme
                    ? "bg-gray-700 text-gray-200 border border-gray-600 rounded-tl-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator when bot is thinking */}
        {askingBot && (
          <div className="mb-4 flex justify-start">
            <div className="flex items-start gap-2 max-w-[80%]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  darktheme ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <Bot
                  className={`w-4 h-4 ${
                    darktheme ? "text-gray-300" : "text-gray-600"
                  }`}
                />
              </div>
              <div
                className={`px-4 py-2.5 rounded-2xl shadow-sm rounded-tl-sm flex items-center gap-2 ${
                  darktheme
                    ? "bg-gray-700 border border-gray-600"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                <span className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-600"}`}>
                  Typing...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className={`flex border-t p-3 gap-2 ${
          darktheme
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-green-100"
        }`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={askingBot}
          placeholder={t("support.inputPlaceholder")}
          className={`flex-grow px-4 py-2.5 rounded-xl border-2 focus:border-green-500 focus:outline-none transition-all duration-300 ${
            darktheme
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        <button
          onClick={sendMessage}
          disabled={askingBot || !input.trim()}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {askingBot ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SupportChat;