
import axios from "axios";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;


const Login = ({ email: prefilledEmail = "" }) => {
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login/`, {
        email,
        password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      console.log("Login successful:", response.data);

      const redirectTo = location.state?.from?.pathname || "/profile";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <form
    onSubmit={handleSubmit}
    className="w-full bg-white border-1 border-black p-8 space-y-6"
  >
   

    {/* Email */}
    <div>
      <label className="block text-sm font-semibold text-black mb-2">
        Email address
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border-1 border-gray-300 text-black focus:outline-none"
        placeholder="your@email.com"
        required
        disabled={!!prefilledEmail}
      />
    </div>

    {/* Password */}
    <div>
      <label className="block text-sm font-semibold text-black mb-2">
        Password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 border-1 border-gray-300 text-black focus:outline-none"
        placeholder="********"
        required
      />
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      disabled={loading || !email || !password}
      className="w-full py-3 border-2 border-black bg-black text-white font-semibold disabled:opacity-100"
    >
      {loading ? "Signing in..." : "Sign in"}
    </button>
  </form>
);

};

export default Login;
