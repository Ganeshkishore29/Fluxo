// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import Signup from '../components/Signup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;


const Register = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
const navigate = useNavigate();
const handleEmailSubmit = async (e) => {
  e.preventDefault();

  if (!email || !email.includes("@")) return;

  setLoading(true);
  try {
    const res = await axios.post(`${API_URL}/email-check/`, { email });
    setEmailExists(res.data.exists);
    setShowLogin(res.data.exists);
  } catch (err) {
    console.error("Email check failed:", err);
    setEmailExists(false);
  } finally {
    setLoading(false);
  }
};


  return (
  <>
    {/* Overlay */}
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      
      {/* Card */}
      <div className="relative w-full max-w-md bg-white border-1 border-black p-8">

        {/* Close Button */}
      <button
  onClick={() => navigate(-1)}
  className="absolute top-3 right-3 text-black font-bold text-xl"
  aria-label="Close"
>
  ×
</button>


        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-black">
            {emailExists !== null
              ? (showLogin ? "Sign in" : "Create account")
              : "Welcome"}
          </h2>
          <p className="mt-2 text-black">
            {emailExists !== null
              ? (showLogin
                  ? "Enter your password"
                  : "Create a new account")
              : "Enter your email address"}
          </p>
        </div>

{emailExists === null && (
  <form onSubmit={handleEmailSubmit} className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-black mb-2">
        Email address
      </label>

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none"
        placeholder="your@email.com"
      />
    </div>

    <button
      type="submit"
      disabled={loading || !email.includes("@")}
      className="w-full py-3 border border-black bg-black text-white font-semibold disabled:opacity-50"
    >
      {loading ? "Checking..." : "Continue"}
    </button>
  </form>
)}

{emailExists !== null && (
  <>
    {showLogin ? <Login email={email} /> : <Signup email={email} />}

    <div className="pt-6 border-t border-black text-center">
      {showLogin ? (
        <>
          <p className="text-sm text-black mb-3">New user?</p>
          <button
            onClick={() => setShowLogin(false)}
            className="font-bold text-black underline"
          >
            Create account
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-black mb-3">
            Already have an account?
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="font-bold text-black underline"
          >
            Sign in
          </button>
        </>
      )}
    </div>
  </>
)}

      </div>
    </div>
  </>
);

};

export default Register;
