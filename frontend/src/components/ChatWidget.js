import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatBox from "./ChatBox";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg z-50"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Box */}
      {open && <ChatBox onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatWidget;
