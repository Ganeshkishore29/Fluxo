import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/chat/`;


const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
const [keyboardOpen, setKeyboardOpen] = useState(false);

  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(API_URL, { message: input });

      if (res.data.type === "products") {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: res.data.reply },
          { role: "products", data: res.data.data },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: res.data.data },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
<div
  className={`
    fixed z-50 bg-white shadow-xl flex flex-col rounded-xl transition-all duration-200

    /* MOBILE */
    ${keyboardOpen 
      ? "bottom-0 h-[60vh]" 
      : "bottom-40 h-[360px]"
    }
    right-2 w-[94vw]

    /* 🖥 DESKTOP */
    md:bottom-24 md:right-6 md:w-80 md:h-[420px]
  `}
>


      
      {/* Header */}
      <div className="bg-black text-white p-3 rounded-t-xl flex justify-between items-center">
        <h3 className="font-semibold">AI Shopping Assistant</h3>
        <button onClick={onClose} className="text-lg">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => {
          // PRODUCT CARDS
          if (msg.role === "products") {
            return (
              <div key={idx} className="grid grid-cols-2 gap-2">
                {msg.data.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      navigate(`/product/${p.id}`);
                      onClose();
                    }}
                    className="border rounded p-2 text-sm cursor-pointer hover:shadow-md transition"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-20 w-full object-cover mb-1 rounded"
                    />
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-gray-600">₹{p.price}</p>
                  </div>
                ))}
              </div>
            );
          }

          // TEXT MESSAGES
          return (
            <div
              key={idx}
              className={`p-2 rounded text-sm max-w-[85%]
                ${
                  msg.role === "user"
                    ? "bg-black text-white ml-auto"
                    : "bg-gray-100 text-black"
                }`}
            >
              {msg.text}
            </div>
          );
        })}

        {loading && (
          <p className="text-xs text-gray-500">Typing...</p>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t flex gap-2">
       <input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onFocus={() => setKeyboardOpen(true)}
  onBlur={() => setKeyboardOpen(false)}
  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  placeholder="Ask me about products..."
  className="flex-1 border border-gray-400 rounded px-2 py-1 text-sm"
/>

        <button
          onClick={sendMessage}
          className="bg-black text-white px-3 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
