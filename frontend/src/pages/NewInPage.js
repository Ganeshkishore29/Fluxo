import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useParams } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;


const NewInpage = () => {
  const { categoryId } = useParams();

  const [products, setProducts] = useState([]);
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState("");

  /* 🔹 Fetch products (NEW IN by category) */
  const fetchProducts = (sort = "") => {
    let url = `${API_URL}/products/new/${categoryId}/`;
    if (sort) url += `?sort=${sort}`;

    axios
      .get(url)
      .then((res) => setProducts(res.data))
      .catch((err) =>
        console.error("Product fetch error", err)
      );
  };

  /* Initial fetch */
  useEffect(() => {
    if (!categoryId) return;
    fetchProducts();
  }, [categoryId]);

  /*  Sort handler */
const handleSort = (sortValue) => {
  setActiveSort(sortValue);
  setShowSort(false);

  let sorted = [...products];

  if (sortValue === "price_asc") {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sortValue === "price_desc") {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  }

  if (sortValue === "new") {
    sorted.sort((a, b) => b.id - a.id); // latest first
  }

  setProducts(sorted);
};


  return (
    <>
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
        NEW IN
      </h1>

      {/* SORT BAR */}
      <div className="px-4 mb-6">
        {/* TOP ROW */}
        <div className="flex items-center gap-4">
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

      {/* PRODUCTS GRID */}
      <div className="mx-0 grid grid-cols-2 md:grid-cols-4">
        {products.length > 0 ? (
          products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No products found.
          </p>
        )}
      </div>
    </>
  );
};

/* SORT BUTTON */
const SortOption = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 border transition ${
      active
        ? "border-black font-semibold"
        : "border-gray-300 hover:border-black"
    }`}
  >
    {label}
  </button>
);

export default NewInpage;
