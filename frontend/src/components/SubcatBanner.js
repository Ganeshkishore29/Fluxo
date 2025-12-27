import { useNavigate } from "react-router-dom";

const SubcatBanner = ({ subcat, align }) => {
  const image = subcat.banner_image;
  const navigate = useNavigate();
  if (!image) return null;

  return (
    <div
      className="
        w-full md:w-[50vw]
        flex flex-col cursor-pointer
      "
      onClick={() => navigate(`/product-list/${subcat.id}`)}
    >
      {/* IMAGE */}
      <div className="relative w-full h-[45vh] md:h-[88vh]">
        <img
          src={`http://localhost:8000${image}`}
          alt={subcat.name}
          className={`
            absolute top-0 h-full object-contain
            ${align === "right" ? "right-0 " : "left-0"}
          `}
        />
      </div>

      {/* TEXT */}
      <div
        className={`
          mt-1 md:mt-2
          px-4 md:px-4
          ${align === "right" ? "self-end text-right pr-6" : "self-start text-left pl-6"}
        `}
      >
        <p className="text-xl md:text-[42px] font-bold tracking-tight leading-none">
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
