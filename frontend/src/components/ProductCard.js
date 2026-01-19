"use client";
import { useState,useEffect } from "react";
import { getToken } from "../utils/auth";
import {useRouter} from 'next/navigation';
import axios from "axios";
import { Heart } from "lucide-react";

const API_URL="http://localhost:8000/api";

const ProductCard = ({ product, onRemoveFromWishlist, disableHover = false }) => {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [token, setToken] = useState(null);

useEffect(() => {
  setToken(getToken());
}, []);

  const router = useRouter();

  const firstImage = product.images?.[0]?.images;
  const secondImage = product.images?.[1]?.images;

const imageSrc = disableHover
  ? `http://localhost:8000${product.thumbnail_url}`
  : `http://localhost:8000${
      hovered && secondImage ? secondImage : firstImage
    }`;

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
        if (onRemoveFromWishlist) onRemoveFromWishlist(product.id);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  return (
    <div
  className="overflow-hidden cursor-pointer"
  onMouseEnter={() =>
    !disableHover && window.innerWidth >= 768 && setHovered(true)
  }
  onMouseLeave={() =>
    !disableHover && window.innerWidth >= 768 && setHovered(false)
  }
  onClick={() => router.push(`/product/${product.id}`)}
>

      {/* IMAGE */}
      <div className="w-full h-[45vh] md:h-[70vh] overflow-hidden">
  {imageSrc && (
    <img
      src={imageSrc}
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

export default ProductCard