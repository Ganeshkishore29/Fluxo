import { useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { getToken } from "../utils/PrivateRoute";

const API_URL = "http://localhost:8000/api";

const PaymentSuccess = () => {
  const token = getToken();
  const [params] = useSearchParams();

  const orderId = params.get("order_id")?.replace("order_", "");

  useEffect(() => {
    if (!orderId) return;

    axios.put(
      `${API_URL}/cashfree/`,
      { order_id: orderId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }, [orderId]);

  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful 🎉
      </h1>
    </div>
  );
};

export default PaymentSuccess;
