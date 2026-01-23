import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/PrivateRoute";
import { Trash2 } from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const Checkout = () => {
  const token = getToken();

  const headers = {
    Authorization: `Bearer ${token}`,
  };
const [showMobileSummary, setShowMobileSummary] = useState(false);

  /* ---------------- CART ---------------- */
  const [cartItems, setCartItems] = useState([]);
  const [checkoutData, setCheckoutData] = useState(null);

  /* ---------------- CONTACT ---------------- */
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  /* ---------------- ADDRESS ---------------- */
  const [addresses, setAddresses] = useState([]);
  const [activeType, setActiveType] = useState("HOME");

  const [form, setForm] = useState({
    address_type: "HOME",
    first_line: "",
    second_line: "",
    city: "",
    pincode: "",
  });

  /* ---------------- UI ---------------- */
  const [error, setError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  const fetchSummary = async () => {
    const res = await axios.get(`${API_URL}/total-bill/`, { headers });
    setCheckoutData(res.data);
  };

  useEffect(() => {
    if (!token) return;

    axios.get(`${API_URL}/cart/`, { headers })
      .then(res => setCartItems(res.data.items || res.data));

    axios.get(`${API_URL}/profile/`, { headers })
      .then(res => setEmail(res.data.email));

    axios.get(`${API_URL}/addresses/`, { headers })
      .then(res => setAddresses(res.data || []));

    fetchSummary();
  }, [token]);

  /* ---------------- REMOVE CART ITEM ---------------- */
  const removeFromCart = async (id) => {
    await axios.delete(`${API_URL}/cart/remove/${id}/`, { headers });
    setCartItems(prev => prev.filter(i => i.id !== id));
    fetchSummary();
  };

  /* ---------------- SAVE ADDRESS ---------------- */
  const handleSaveAddress = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/addresses/`,
        form,
        { headers }
      );

      setAddresses(prev => [
        ...prev.filter(a => a.address_type !== res.data.address_type),
        res.data
      ]);

    } catch {
      setError("Failed to save address");
    }
  };
const selectedAddress =
  activeType === "LIVE"
    ? null
    : addresses.find(a => a.address_type === activeType);

const handlePayment = async () => {
  if (!phone) return setError("Phone number required");
  if (!selectedAddress && activeType !== "LIVE")
    return setError("Select address");
  if (cartItems.length === 0)
    return setError("Cart is empty");

  setPayLoading(true);
  setError("");

  try {
    const res = await axios.post(
      `${API_URL}/cashfree/`,
      {
        phone,
        email,
        address_id: selectedAddress?.id || null,
      },
      { headers }
    );

    // Cashfree handles redirect / popup
    window.Cashfree.checkout({
      paymentSessionId: res.data.payment_session_id,
      redirectTarget: "_self",
    });

  } catch (err) {
    console.error("PAYMENT ERROR ", err.response?.data || err.message);

    setError(
      err.response?.status === 503
        ? "Payment gateway is temporarily unavailable. Please retry."
        : "Payment initiation failed"
    );
  } finally {
    setPayLoading(false);
  }
};


  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

      {/* LEFT */}
      <div className="lg:col-span-2 space-y-8">

        {/* CART */}
        <div className="border p-6 rounded">
          <h2 className="font-semibold mb-4">Your Cart</h2>

          <div className="flex gap-4">
            {cartItems.map(item => (
              <div key={item.id} className="relative w-20 h-24 border rounded">
                <img
                  src={`http://localhost:8000${item.product.images[0].images}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute -top-2 -right-2 bg-white p-1 rounded-full"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div className="border p-6 rounded">
          <h2 className="font-semibold mb-4">Contact</h2>
          <input value={email} disabled className="border p-3 w-full mb-3" />
          <input
            placeholder="Phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="border p-3 w-full"
          />
        </div>

        {/* ADDRESS */}
        <div className="border p-6 rounded">
          <h2 className="font-semibold mb-4">Delivery Address</h2>

          {/* TABS */}
          <div className="flex gap-3 mb-4">
            {["HOME", "OFFICE", "LIVE"].map(type => (
              <button
                key={type}
                onClick={() => {
                  setActiveType(type);
                  setForm({ ...form, address_type: type });
                }}
                className={`px-4 py-2 border ${
                  activeType === type ? "bg-black text-white" : ""
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* ADDRESS DISPLAY / FORM */}
          {activeType !== "LIVE" && selectedAddress ? (
            <div className="border p-4 rounded">
              <p className="font-medium">{selectedAddress.address_type}</p>
              <p className="text-sm">
                {selectedAddress.first_line}, {selectedAddress.city} - {selectedAddress.pincode}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                placeholder="Address line 1"
                className="border p-3 w-full"
                onChange={e => setForm({ ...form, first_line: e.target.value })}
              />
              <input
                placeholder="Address line 2"
                className="border p-3 w-full"
                onChange={e => setForm({ ...form, second_line: e.target.value })}
              />
              <input
                placeholder="City"
                className="border p-3 w-full"
                onChange={e => setForm({ ...form, city: e.target.value })}
              />
              <input
                placeholder="Pincode"
                className="border p-3 w-full"
                onChange={e => setForm({ ...form, pincode: e.target.value })}
              />

              <button
                onClick={handleSaveAddress}
                className="w-full py-3 bg-black text-white"
              >
                Save {activeType} Address
              </button>
            </div>
          )}
        </div>

        
      </div>

      {/* RIGHT */}
     {checkoutData && (
  <div
    className="
      border border-gray-200
      rounded-xl
      bg-white
      p-6
      space-y-5
      md:sticky md:top-6
      shadow-sm
    "
  >
    {/* TITLE */}
    <h3 className="text-lg font-semibold tracking-wide uppercase">
      Order Summary
    </h3>
{error && <p className="text-red-600">{error}</p>}
    {/* PRICE DETAILS */}
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Order value</span>
        <span className="font-medium">
          ₹{checkoutData.items_total}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600">Delivery</span>
        <span className="font-medium">
          {checkoutData.free_delivery ? "FREE" : `₹${checkoutData.delivery_fee}`}
        </span>
      </div>

      <hr />

      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>₹{checkoutData.final_total}</span>
      </div>
    </div>

    {/* FREE DELIVERY MESSAGE */}
    {!checkoutData.free_delivery && (
      <p className="text-xs text-gray-500">
        Add items worth ₹{1999 - checkoutData.items_total} more for FREE delivery.
      </p>
    )}

    {/* PAY BUTTON */}
    <button
      onClick={handlePayment}
      disabled={payLoading}
      className="
        w-full
        mt-4
        py-4
        bg-black
        text-white
        text-sm
        font-medium
        uppercase
        tracking-widest
        rounded
        transition
        hover:bg-gray-800
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      {payLoading ? "Processing…" : "Proceed to Pay"}
    </button>

    {/* INFO TEXT */}
    <p className="text-[11px] text-gray-500 leading-relaxed">
      Prices and delivery costs are not confirmed until payment.
      <br />
      Secure payment powered by Cashfree.
    </p>
  </div>
)}



    </div>
  );
};

export default Checkout;
