import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;


const Signup = ({ email: prefilledEmail = "" }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
useEffect(() => {
  setEmail(prefilledEmail);
}, [prefilledEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/register/`, {
        full_name: name,
        email,
        password,
      });

      alert("Signup successful!");
    } catch (err) {
      if (err.response?.data) {
        alert(Object.values(err.response.data).flat().join("\n"));
      } else {
        alert("Signup failed");
      }
    }
  };

  return (
    /* ===== CENTERED OVERLAY ===== */
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      
      {/* ===== CARD ===== */}
      <div className="relative w-full max-w-md bg-white px-8 py-10 shadow-xl">

        {/* ❌ CLOSE BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-black text-xl font-bold hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#c4b8a6] text-black focus:outline-none focus:border-black"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#c4b8a6] text-black focus:outline-none focus:border-black"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#c4b8a6] text-black focus:outline-none focus:border-black"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-semibold hover:bg-gray-900 transition-colors"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
