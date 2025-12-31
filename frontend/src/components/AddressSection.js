import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../utils/PrivateRoute";
const API_URL = "http://localhost:8000/api";

const AddressSection = ({ onSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    address_type: "HOME",
    first_line: "",
    second_line: "",
    city: "",
    pincode: "",
  });

  const token = getToken()

  useEffect(() => {
    axios
      .get(`${API_URL}/addresses/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAddresses(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/addresses/`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses([res.data]);
      onSelect(res.data.id);
    } catch (err) {
      alert("Failed to save address");
    }
  };

  if (loading) return <p>Loading address...</p>;

  return (
    <div className="border p-6 rounded-md">
      <h2 className="text-lg font-semibold mb-4">
        Delivery Address
      </h2>

      {/* EXISTING ADDRESSES */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className="flex items-start gap-3 border p-3 rounded cursor-pointer"
            >
              <input
                type="radio"
                name="address"
                onChange={() => onSelect(addr.id)}
              />
              <div>
                <p className="font-medium capitalize">
                  {addr.address_type}
                </p>
                <p className="text-sm text-gray-600">
                  {addr.first_line}, {addr.city} - {addr.pincode}
                </p>
              </div>
            </label>
          ))}
        </div>
      ) : (
        /* NEW ADDRESS FORM */
        <div className="space-y-4">
          <select
            className="border p-3 rounded w-full"
            value={form.address_type}
            onChange={(e) =>
              setForm({ ...form, address_type: e.target.value })
            }
          >
            <option value="HOME">Home</option>
            <option value="OFFICE">Office</option>
            <option value="LIVE">Live</option>
          </select>

          <input
            type="text"
            placeholder="Address line 1"
            className="border p-3 rounded w-full"
            onChange={(e) =>
              setForm({ ...form, first_line: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Address line 2 (optional)"
            className="border p-3 rounded w-full"
            onChange={(e) =>
              setForm({ ...form, second_line: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              className="border p-3 rounded"
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Pincode"
              className="border p-3 rounded"
              onChange={(e) =>
                setForm({ ...form, pincode: e.target.value })
              }
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-black text-white uppercase"
          >
            Save Address
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressSection;
