// src/utils/PrivateRoute.jsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../utils/auth";

export default function ProtectedPage({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.push("/register");
    } else {
      setToken(t);
    }
  }, [router]);

  if (!token) return null;

  return children;
}
