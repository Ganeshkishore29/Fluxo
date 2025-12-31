import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/PrivateRoute";

const API_URL = "http://localhost:8000/api";

const PaymentSuccess = () => {
  const token = getToken();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const orderId = localStorage.getItem("last_order_id");
    if (!orderId) return;

    axios.get(
      `${API_URL}/cashfree/verify/?order_id=${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(res => {
      if (res.data.status === "success") {
        localStorage.removeItem("last_order_id");
        setStatus("success");
      } else {
        setStatus("pending");
      }
    })
    .catch(() => setStatus("failed"));
  }, []);

  if (status === "verifying") {
    return <div className="h-screen flex items-center justify-center">
      <p>Verifying payment...</p>
    </div>;
  }

  if (status === "pending") {
    return <div className="h-screen flex items-center justify-center">
      <p>Payment pending. Please wait.</p>
    </div>;
  }

  if (status === "failed") {
    return <div className="h-screen flex items-center justify-center text-red-600">
      Payment verification failed.
    </div>;
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful 🎉
      </h1>
    </div>
  );
};

export default PaymentSuccess;
