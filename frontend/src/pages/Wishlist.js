import React, { useEffect, useState } from "react";
import { getToken } from "../utils/PrivateRoute";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const token = getToken();
   
  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/wishlist/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setWishlistItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching wishlist:", error);
      });
  }, [token]);
  const handleRemoveFromWishlist = (productId) => {
  setWishlistItems((prev) =>
    prev.filter((item) => item.product.id !== productId)
  );
};


  return (
    <div>
      {/* TITLE */}
      <h1
        className="
          p-3 md:p-5 mb-1
          text-[70px]
          font-hnm
          font-bold
          tracking-tight
          uppercase
        "
      >
        Favorites
      </h1>

      {/* CONTENT */}
      {token && wishlistItems.length > 0 ? (
       <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-3 ">
  {wishlistItems.map((item) => (
    <div key={item.product.id} className="flex flex-col ">
      <ProductCard
        product={item.product}
        onRemoveFromWishlist={handleRemoveFromWishlist}
      />

      
    </div>
  ))}
</div>

      ) : (
        <div className="p-5 text-gray-700">
          <p className="text-lg">
            <span className="font-bold">0 Items</span>
          </p>
          <p className="mt-2">
            Tap the heart icon on items to save them here.
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
    </div>
  );
};

export default Wishlist;
