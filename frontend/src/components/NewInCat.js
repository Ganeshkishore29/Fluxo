import { useNavigate } from "react-router-dom";

const NewInCat = ({ product }) => {
  const navigate = useNavigate();
  const SecondImage = product.images?.[1]?.images;

  return (
    <div
      className="w-full h-[30vh] md:h-[40vh] overflow-hidden cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {SecondImage && (
        <img
          src={SecondImage}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300"
        />
      )}
    </div>
  );
};

export default NewInCat;
