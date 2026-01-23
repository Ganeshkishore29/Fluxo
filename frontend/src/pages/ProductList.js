import ProductCard from "../components/ProductCard";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";


const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const ProductList = () => {
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState("");

  // Fetch products (with optional sort)
  const fetchProducts = (sort = "") => {
    let url = `${API_BASE_URL}/products/filter-sort/?sub_category_id=${id}`;
    if (sort) url += `&sort=${sort}`;

    axios
      .get(url)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product fetch error", err));
  };

  useEffect(() => {
    if (!id) return;

    fetchProducts();

    axios
      .get(`${API_BASE_URL}/sub-categories/${id}/`)
      .then((res) => setSubCategoryName(res.data.name))
      .catch((err) => console.error("Sub-category fetch error", err));
  }, [id]);

  const handleSort = (sortValue) => {
    setActiveSort(sortValue);
    fetchProducts(sortValue);
    setShowSort(false);
  };

  return (
    <div>
      {/* TITLE */}
      <h1
        className="
          p-3 md:p-5 mb-1
          text-3xl sm:text-[60px] md:text-[60px] md:my-6 sm:my-6
          font-hnm font-bold tracking-tight capitalize
        "
      >
        {subCategoryName}
      </h1>

{/* SORT BAR */}
<div className="px-4 mb-6">
  {/* TOP ROW */}
  <div className="flex items-center gap-4">
    {/* SORT LABEL (TRIGGER ONLY) */}
    <button
      onClick={() => setShowSort(!showSort)}
      className="
        text-base md:text-lg
        font-semibold
        tracking-wide
        text-black
        border-b border-black
      "
    >
      SORT
    </button>

    {/* DESKTOP OPTIONS */}
    {showSort && (
      <div className="hidden sm:flex gap-3">
        <SortOption
          label="New In"
          active={activeSort === "new"}
          onClick={() => handleSort("new")}
        />
        <SortOption
          label="Price: Low → High"
          active={activeSort === "price_asc"}
          onClick={() => handleSort("price_asc")}
        />
        <SortOption
          label="Price: High → Low"
          active={activeSort === "price_desc"}
          onClick={() => handleSort("price_desc")}
        />
      </div>
    )}
  </div>

  {/* MOBILE OPTIONS */}
  {showSort && (
    <div className="sm:hidden mt-4 flex gap-3 overflow-x-auto pb-2">
      <SortOption
        label="New In"
        active={activeSort === "new"}
        onClick={() => handleSort("new")}
      />
      <SortOption
        label="Low → High"
        active={activeSort === "price_asc"}
        onClick={() => handleSort("price_asc")}
      />
      <SortOption
        label="High → Low"
        active={activeSort === "price_desc"}
        onClick={() => handleSort("price_desc")}
      />
    </div>
  )}
</div>



      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};


const SortOption = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2
      text-sm md:text-base
      whitespace-nowrap
      border
      ${
        active
          ? "border-black font-semibold"
          : "border-gray-300"
      }
      hover:border-black
      transition
    `}
  >
    {label}
  </button>
);

export default ProductList;
