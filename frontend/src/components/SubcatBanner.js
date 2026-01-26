import { useNavigate } from "react-router-dom";
const SubcatBanner = ({ subcat, align }) => {
  const image = subcat.banner_image;
  const navigate = useNavigate();

  if (!image) return null;

  return (
    <div
      className="w-full flex flex-col cursor-pointer"
      onClick={() => navigate(`/product-list/${subcat.id}`)}
    >
      {/* IMAGE */}
      <div className="relative w-full h-[45vh] md:h-[70vh] lg:h-[88vh] overflow-hidden">
        <img
          src={image}
          alt={subcat.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* TEXT */}
      <div
        className={`
          mt-2 px-4
          text-center
          md:text-left
          
          ${align === "right" ? "md:text-right md:self-end" : ""}
        `}
      >
        <p className="text-xl md:text-3xl sm:text-20px lg:text-[42px] font-bold tracking-tight leading-tight">
          {subcat.name}
        </p>
        <p className="text-xs md:text-sm font-semibold tracking-wide mt-1 hover:underline">
          EXPLORE MORE
        </p>
      </div>
    </div>
  );
};

export default SubcatBanner;
