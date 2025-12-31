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
        className="
          fixed
          right-4
          bottom-24        /*  Mobile: above checkout bar */
          md:bottom-6      /*  Desktop */
          bg-black
          text-white
          p-4
          rounded-full
          shadow-lg
          z-[9999]
        "
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Box */}
      {open && <ChatBox onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatWidget;
