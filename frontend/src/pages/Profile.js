import { useEffect, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/PrivateRoute";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const GEO_API = import.meta.env.VITE_GEO_API;
const Profile = () => {
  const navigate = useNavigate();
  const token = getToken();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [activeAddressType, setActiveAddressType] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [addressError, setAddressError] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [addressForm, setAddressForm] = useState({
    address_type: "HOME",
    first_line: "",      
    second_line: "",     
    city: "",
    pincode: "",
  });
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [deleteType, setDeleteType] = useState(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!token) {
      navigate("/register");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${API_URL}/profile/`, { headers })
      .then(res => setProfile(res.data))
      .catch(() => navigate("/register"));

    axios.get(`${API_URL}/orders/`, { headers })
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]));

    axios.get(`${API_URL}/addresses/`, { headers })
      .then(res => setAddresses(res.data))
      .catch(() => setAddresses([]));
  }, [token, navigate]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/register");
  };

  /* ================= SAVE ADDRESS ================= */
  const handleAddressSubmit = () => {
    setAddressError("");

    const exists = addresses.some(
      a => a.address_type === addressForm.address_type && a.address_type !== editingType
    );

    if (exists) {
      setAddressError(
        `You already have a ${addressForm.address_type} address. Please edit it instead.`
      );
      return;
    }

    if (!addressForm.first_line.trim()) {
      setAddressError("House / Flat number is required.");
      return;
    }

    setIsSavingAddress(true);

    axios.post(`${API_URL}/addresses/`, addressForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setAddresses(prev => [
          ...prev.filter(a => a.address_type !== res.data.address_type),
          res.data
        ]);
        resetAddressForm();
      })
      .finally(() => setIsSavingAddress(false));
  };

  /* ================= EDIT ================= */
  const handleEdit = (addr) => {
    setAddressForm({
      address_type: addr.address_type,
      first_line: addr.first_line,
      second_line: addr.second_line || "",
      city: addr.city,
      pincode: addr.pincode,
    });
    setEditingType(addr.address_type);
    setActiveAddressType(addr.address_type);
    setShowAddressForm(true);
  };

  /* ================= DELETE ================= */
 const handleDeleteClick = (type) => {
  setDeleteType(type);
  setShowDeleteConfirm(true);
};

const confirmDeleteAddress = () => {
  axios
    .delete(`${API_URL}/addresses/${deleteType}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setAddresses((prev) =>
        prev.filter((a) => a.address_type !== deleteType)
      );
      setShowDeleteConfirm(false);
      setDeleteType(null);
    });
};



  /* ================= LIVE LOCATION (SAFE) ================= */
const handleUseLiveLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  setIsLocating(true);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const url = `${GEO_API}?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1&zoom=18`;

        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Fluxo-Ecommerce-App (ganesh@gmail.com)",
          },
        });

        const data = await res.json();

        console.log(" Full Reverse Response:", data);
        console.log(" Address Object:", data.address);

        const addr = data.address || {};

        setAddressForm((prev) => ({
  ...prev,

  //  Do NOT auto-fill house number
  first_line: prev.first_line,

  //  Use best-available locality info
  second_line: [
    addr.road,                 // if exists
    addr.neighbourhood,        // fallback
    addr.suburb,               // fallback
  ]
    .filter(Boolean)
    .join(", "),

  // City logic (robust)
  city:
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    "",


  pincode: addr.postcode || "",
}));

      } catch (err) {
        console.error(err);
        alert("Unable to fetch address");
      } finally {
        setIsLocating(false);
      }
    },
    (err) => {
      console.error(err);
      alert("Location permission denied");
      setIsLocating(false);
    }
  );
};




  const resetAddressForm = () => {
    setAddressForm({
      address_type: activeAddressType || "HOME",
      first_line: "",
      second_line: "",
      city: "",
      pincode: "",
    });
    setEditingType(null);
    setShowAddressForm(false);
    setAddressError("");
  };

  if (!profile) return <p className="p-6">Loading profile…</p>;

  return (
    <div className="p-6 max-w-3xl md:mx-6 space-y-10">

      <h1 className="text-[60px] font-bold uppercase">Account</h1>

      {/* PROFILE */}
      <div>
        <h2 className="text-xl font-semibold">Welcome, {profile.full_name}</h2>
        <p className="text-gray-600">{profile.email}</p>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="mt-4 underline uppercase"
        >
          Sign out
        </button>
      </div>
{/* DELETE ADDRESS MODAL */}
{showDeleteConfirm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded w-[90%] max-w-sm">
      <h3 className="font-semibold mb-2">
        Delete {deleteType} address?
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        This address will be permanently removed.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowDeleteConfirm(false);
            setDeleteType(null);
          }}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleteAddress}
          className="bg-black rounded text-white px-4 py-2 "
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      {/* ADDRESS TABS */}
      <div>
        <h3 className="font-semibold mb-3">Saved Addresses</h3>

        <div className="flex gap-3 mb-4">
          {["HOME", "OFFICE"].map(type => (
            <button
              key={type}
              onClick={() => setActiveAddressType(type)}
              className={`px-4 py-2  text-sm ${
                activeAddressType === type
                  ? "bg-black text-white"
                  : "border hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {!activeAddressType && (
          <p className="text-sm text-gray-400">
            Select an address type to view details.
          </p>
        )}

        {activeAddressType &&
          addresses
            .filter(a => a.address_type === activeAddressType)
            .map(addr => (
              <div key={addr.address_type} className="border p-4 rounded mb-3 flex justify-between">
                <div>
                  <p className="font-semibold">{addr.address_type}</p>
                  <p className="text-sm text-gray-600">
                    {addr.first_line}<br />
                    {addr.second_line}<br />
                    {addr.city} – {addr.pincode}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleEdit(addr)} className="underline text-sm">Edit</button>
  <button
  onClick={() => handleDeleteClick(addr.address_type)}
  className="underline text-sm text-red-600"
>
  Delete
</button>

                </div>
              </div>
            ))}

        {activeAddressType &&
          addresses.filter(a => a.address_type === activeAddressType).length === 0 && (
            <button
              onClick={() => {
                setAddressForm({ ...addressForm, address_type: activeAddressType });
                setShowAddressForm(true);
              }}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Add {activeAddressType} Address
            </button>
          )}
      </div>

      {/* ADDRESS FORM */}
      {showAddressForm && (
        <div className="border p-4 rounded space-y-3">
          <h4 className="font-semibold">
            {editingType ? "Edit Address" : "Add Address"}
          </h4>

          <button
            onClick={handleUseLiveLocation}
            disabled={isLocating}
            className="text-sm underline"
          >
            {isLocating ? "Detecting location…" : "Use live location"}
          </button>

          <input
            className="w-full border p-2 rounded"
            placeholder="House / Flat Number (required)"
            value={addressForm.first_line}
            onChange={e => setAddressForm({ ...addressForm, first_line: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Street / Area"
            value={addressForm.second_line}
            onChange={e => setAddressForm({ ...addressForm, second_line: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="City"
            value={addressForm.city}
            onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Pincode"
            value={addressForm.pincode}
            onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
          />

          {addressError && (
            <p className="text-sm text-red-600">{addressError}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddressSubmit}
              disabled={isSavingAddress}
              className="px-4 py-2 bg-black text-white rounded"
            >
              {isSavingAddress ? "Saving…" : "Save"}
            </button>
            <button onClick={resetAddressForm} className="px-4 py-2 border rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ORDERS */}
      <div>
        <h3 className="font-semibold mb-3">My Orders</h3>
        {orders.length === 0 ? (
         <> <p className="text-gray-500">
            You haven’t placed any orders yet. Start shopping!
          </p>          <Link to="/">
<button
  className="
    mt-4
    px-10 py-5
    border border-black
    bg-white text-black
    font-hnm uppercase
    tracking-wide
    transition-all duration-200
    hover:bg-black hover:text-white
  "
>
  Explore <span className="font-extrabold"> FLUXO</span>
</button></Link>
        </>) : (
          orders.map(o => (
            <div key={o.id} className="border p-3 rounded mb-2">
              Order #{o.id} — ₹{o.total_amount}
            </div>
          ))
        )}
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-sm w-[90%]">
            <h3 className="font-semibold mb-2">Sign out?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to sign out?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleLogout} className="bg-black text-white px-4 py-2 rounded">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
