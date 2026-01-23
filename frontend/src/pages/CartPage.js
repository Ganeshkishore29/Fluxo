import React, { useEffect, useState } from 'react'
import { getToken } from '../utils/PrivateRoute'
import axios from 'axios'
import { Link } from 'react-router-dom'
import CartCard from '../components/CartCard'
import { Plus, Minus, Trash2 } from "lucide-react";

import TotalBill from '../components/TotalBill'


const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;


const CartPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [cartError, setCartError] = useState({});
  const [checkoutKey, setCheckoutKey] = useState(0);
  const [checkoutData, setCheckoutData] = useState(null);


  const token = getToken()
 useEffect(() => {
  if (!token) return;

  axios
    .get(`${API_URL}/cart/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setCartItems(res.data.items))
    .catch(() => console.error("Failed to fetch cart"));
}, [token]); 
useEffect(() => {
  if (!token || cartItems.length === 0) {
    setCheckoutData(null);
    return;
  }

  axios
    .get(`${API_URL}/total-bill/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setCheckoutData(res.data))
    .catch(() => setCheckoutData(null));
}, [cartItems, token]); 



const updateCartItem = async (itemId, action) => {
  try {
    const res = await axios.patch(
      `${API_URL}/cart/`,
      { item_id: itemId, action },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCartItems(res.data.items); 

    setCartError((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });

  } catch (error) {
    if (error.response?.data?.error) {
      setCartError((prev) => ({
        ...prev,
        [itemId]: error.response.data.error,
      }));
    }
  }
};





  return (
    <div>
 <div>
  {/* TITLE */}
  <h1
    className="
      px-3 md:px-5
      pt-3 md:pt-5
      pb-1
      text-[70px]
      font-hnm
      font-bold
      tracking-tight
      uppercase
    "
  >
    Cart
  </h1>

  {/* FREE SHIPPING INFO */}
  <div className="px-3 md:px-5  mb-4">
    <div className="border-y border-gray-300 py-2 px-5">
      <p className="text-sm text-gray-500">
        Free shipping above ₹1999
      </p>
    </div>
  </div>
</div>


      {/* CONTENT */}
{token && cartItems.length > 0 ? (
  <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.2fr] gap-6 px-4">
    
    {/* LEFT: CART ITEMS */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cartItems.map((item) => (
        <div key={item.id} className="flex flex-col">
          <CartCard
            product={item.product}
            size={item.size_name}
            Qty={item.quantity}
          />

          {cartError[item.id] && (
            <p className="mt-2 mx-3 text-xs text-red-600 font-medium">
              {cartError[item.id]}
            </p>
          )}

          {/* Quantity Controller */}
          <div className="mt-2 mx-3 text-sm flex justify-between items-center border rounded-md px-3 py-2">
            {item.quantity === 1 ? (
              <Trash2
                onClick={() => updateCartItem(item.id, "remove")}
                className="cursor-pointer"
              />
            ) : (
              <Minus
                onClick={() => updateCartItem(item.id, "decrease")}
                className="cursor-pointer"
              />
            )}

            <span>{item.quantity}</span>

            <Plus
              onClick={() => updateCartItem(item.id, "increase")}
              className="cursor-pointer"
            />
          </div>
        </div>
      ))}
    </div>

    {/* RIGHT: Totalbill (DESKTOP) */}
    <div className="hidden lg:block">
     <TotalBill checkoutData={checkoutData} />

    </div>

  </div>
)  : (
        <div className="p-5 text-gray-700">
          <p className="text-lg">
            <span className="font-bold">0 Items</span>
          </p>
          <p className="mt-2">
            Your cart is empty. Add items to your cart to see them here.
          </p>

          <Link to="/">
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
        </div>
      )}
{/* MOBILE STICKY CHECKOUT */}
{checkoutData && (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">Total</p>
        <p className="text-lg font-semibold">
          ₹{checkoutData.final_total}
        </p>
      </div>

      <button
        className="
          bg-black
          text-white
          px-6
          py-3
          text-sm
          font-medium
          hover:bg-gray-800
        "
      >
        PROCEED
      </button>
    </div>
  </div>
)}


    </div>
  )
}

export default CartPage