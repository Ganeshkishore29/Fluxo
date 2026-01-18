import { useNavigate } from "react-router-dom";

const NewInCat = ({
  product,
  useThumbnail = false,  
}) => {
  const navigate = useNavigate();

  const imageSrc = useThumbnail
    ? product.thumbnail_url
      ? `http://localhost:8000${product.thumbnail_url}`
      : null
    : product.images?.[1]?.images
      ? `http://localhost:8000${product.images[1].images}`
      : null;

  return (
    <div
      className="w-full h-[30vh] md:h-[40vh] overflow-hidden cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300"
        />
      )}
    </div>
  );
};

export default NewInCat;
