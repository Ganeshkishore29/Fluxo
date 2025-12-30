import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/PrivateRoute";
import AddressSection from "../components/AddressSection";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

const Checkout = () => {
  const token = getToken();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
const[Totalbill,setTotalbill]=useState([])
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/total-bill/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTotalbill(res.data));
  }, [token]);

  useEffect(() => {
  if (!token ) {
    setTotalbill(null);
    return;
  }

  axios
    .get(`${API_URL}/total-bill/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setCheckoutData(res.data))
    .catch(() => setCheckoutData(null));
}, [token]); 

  const handlePayment = async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/cashfree/`,
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sessionId = res.data.payment_session_id;

      window.Cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });

    } catch (err) {
      setError("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* LEFT */}
      <div className="md:col-span-2 space-y-8">

        {/* ADDRESS */}
        <div className="border p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
          <AddressSection onSelect={setSelectedAddress} />

          {selectedAddress && (
            <p className="mt-3 text-green-600 text-sm">
              Address selected ✔
            </p>
          )}
        </div>

        {/* CONTACT */}
        <div className="border p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              className="border p-3 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="border p-3 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded text-lg"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

      </div>

      {/* RIGHT */}
       <div className="
  max-w-2xl
  mx-auto
  p-6
  border border-gray-200
  rounded-md
  bg-white
  md:sticky md:top-6
">


      {/* SUMMARY */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Order value</span>
          <span>Rs.{Totalbill.items_total}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Estimated delivery fee</span>
          <span>
            {Totalbill.free_delivery ? (
              <span className="font-medium">FREE</span>
            ) : (
              `Rs${Totalbill.delivery_fee}`
            )}
          </span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>₹{Totalbill.final_total}</span>
        </div>
      </div>

      {/* FREE DELIVERY MESSAGE */}
      {!Totalbill.free_delivery && (
        <p className="text-sm text-gray-600 mt-3">
          Add items worth ₹{1999 - Totalbill.items_total} more for FREE delivery.
        </p>
      )}

      {/* ACTION */}
      <Link to="/checkout">
        <button
          className="
            w-full mt-6 py-4
            bg-black text-white
            font-medium tracking-wide
            hover:bg-gray-800 transition
            uppercase
          "
        >
          Continue to Checkout
        </button>
      </Link>

      {/* PAYMENT METHODS */}
      <div className="mt-5">
        <p className="text-xs text-gray-600 mb-2">
          We accept
        </p>
        <img
          src="/payment_logos.png"
          alt="Payment methods"
          className="
            h-6 sm:h-7 md:h-8
            object-contain
      
          "
        />
      </div>

      {/* INFO */}
      <p className="text-xs text-gray-600 mt-4 leading-relaxed">
        Prices and delivery costs are not confirmed until checkout.<br />
        15 days free returns. Read more about our return & refund policy.<br />
        Need help? Contact Customer Support AI Assistant.<br />
        SMS updates will be sent to your registered mobile number.
      </p>
    </div>

    </div>
  );
};

export default Checkout;
