import React from "react";
import { useRouter } from "next/navigation";

const SmallProductCard = ({ product }) => {
  const router = useRouter();

  const Image = product.thumbnail_url;

  if (!Image) return null;

  return (
    <div
      className="w-full h-[35vh] md:h-[40vh] overflow-hidden cursor-pointer"
      onClick={() => router.push(`/product/${product.id}`)}
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
