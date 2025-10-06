import React, { useState } from "react";
import axios from "axios";

const SupportChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/support/ask", { question: input });
      const botMsg = { sender: "bot", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Try again later." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="p-3 bg-blue-600 text-white font-semibold rounded-t-lg">
        💬 Customer Support
      </div>

      <div className="h-64 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className={`my-2 ${m.sender === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block px-3 py-2 rounded-lg ${
                m.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-grow p-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SupportChat;
