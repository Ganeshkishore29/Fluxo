import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/PrivateRoute";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const CartCard = ({ product, size, Qty }) => {
  const Image = product.images?.[0]?.images;
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const token = getToken();

  
  const total = product.price * Qty;

  
  useEffect(() => {
    if (!token || !product?.id) return;

    axios
      .get(`${API_URL}/wishlist/${product.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setLiked(res.data.liked))
      .catch(() => setLiked(false));
  }, [product.id, token]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("Please login to use wishlist");
      return;
    }

    try {
      if (!liked) {
        await axios.post(
          `${API_URL}/wishlist/${product.id}/toggle/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(true);
      } else {
        await axios.delete(
          `${API_URL}/wishlist/${product.id}/toggle/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(false);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex gap-4 border p-3 cursor-pointer hover:shadow-md transition"
    >
      {/* IMAGE */}
      <div className="w-[35%] h-[140px] overflow-hidden">
        <img
          src={`http://localhost:8000${Image}`}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* DETAILS */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-sm font-medium line-clamp-2">
            {product.name}
          </h2>

          <div onClick={handleWishlistToggle} className="cursor-pointer">
            <Heart
              size={16}
              className={liked ? "fill-black stroke-black" : "stroke-black"}
            />
          </div>
        </div>

        <p className="text-sm font-semibold mt-1">
          Rs.{product.price}
        </p>
        <p className="text-sm">Size: {size}</p>
        <p className="text-sm">Qty: {Qty}</p>

        {/* TOTAL */}
        <p className="text-sm font-semibold">
          Total: Rs.{total}
        </p>
      </div>
    </div>
  );
};

export default CartCard;
