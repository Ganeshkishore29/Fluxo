import React from "react";
import { useNavigate } from "react-router-dom";

const SimilarProduct = ({ product }) => {
  const navigate = useNavigate();

  const image =
    product.thumbnail ||
    product.thumbnail_url ||
    product.images?.[0]?.images;

  if (!image) return null;

  return (
    <div
      className="h-[35vh] cursor-pointer overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <img
        src={`http://localhost:8000${image}`}
        alt={product.name}
        className="w-full h-full object-cover hover:scale-105 transition"
      />
    </div>
  );
};

export default SimilarProduct;
