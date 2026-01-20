import React from "react";
import { useNavigate} from "react-router-dom";

const SmallProductCard = ({ product }) => {
  const navigate = useNavigate();

  const Image = product.thumbnail_url;

  if (!Image) return null;

  return (
    <div
      className="w-full h-[35vh] md:h-[40vh] overflow-hidden cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <img
        src={`http://localhost:8000${Image}`}
        alt={product.name}
        className="w-full h-full object-cover transition-all duration-300"
      />
    </div>
  );
};

export default SmallProductCard;
