import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { getToken } from "../utils/PrivateRoute";


const API_URL = "http://localhost:8000/api";

const SimilarProduct = ({ product }) => {
  
 const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const token = getToken();
  const navigate = useNavigate();

  const firstImage = product.images?.[0]?.images;
  const secondImage = product.images?.[1]?.images;

  useEffect(() => {
    if (!token || !product?.id) return;

    axios
      .get(`${API_URL}/wishlist/${product.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setLiked(res.data.liked))
      .catch(() => setLiked(false));
  }, [product.id, token]);

  const handleWishlistToggle = async () => {
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
      className="overflow-hidden cursor-pointer"
      onMouseEnter={() => window.innerWidth >= 768 && setHovered(true)}
      onMouseLeave={() => window.innerWidth >= 768 && setHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* IMAGE */}
      <div className="w-full h-[45vh] md:h-[70vh] overflow-hidden">
        {firstImage && (
          <img
            src={`http://localhost:8000${
              hovered && secondImage ? secondImage : firstImage
            }`}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
        )}
      </div>

      {/* DETAILS */}
      <div className="p-2 md:p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm md:text-base font-medium leading-tight line-clamp-2">
            {product.name}
          </h2>

          {/* Heart */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistToggle();
            }}
            className="p-2 md:p-[5px] cursor-pointer"
          >
            <Heart
              size={18}
              className={liked ? "fill-black stroke-black" : "stroke-black"}
            />
          </div>
        </div>

        <p className="text-sm md:text-base font-semibold mt-1">
          Rs.{product.price}
        </p>
      </div>
    </div>
  );
};



export default SimilarProduct;
