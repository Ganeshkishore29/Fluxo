
import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { useParams} from "react-router-dom";
import { getToken } from "../utils/PrivateRoute";

const API_URL = "http://localhost:8000/api";

const Recommendations = () => {

const { categoryId } = useParams();
  const [token, setToken] = useState(null);

useEffect(() => {
  setToken(getToken());
}, []);

  const [recommendations, setRecommendations] = useState([]);
  const [sortedRecs, setSortedRecs] = useState([]);
  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState("");

  /* Fetch recommendations */
  useEffect(() => {
    if (!token || !categoryId) return;

    axios
      .get(
        `${API_URL}/recommendations/?k=8&category_id=${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const data = res.data.results || [];
        setRecommendations(data);
        setSortedRecs(data); // initialize sorted list
      })
      .catch((err) =>
        console.error("Recommendation fetch error", err)
      );
  }, [token, categoryId]);

  /*  Handle sorting (LOCAL SORT — IMPORTANT) */
  const handleSort = (sortValue) => {
    setActiveSort(sortValue);
    setShowSort(false);

    const sorted = [...sortedRecs];



    if (sortValue === "price_asc") {
      sorted.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sortValue === "price_desc") {
      sorted.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }

    setSortedRecs(sorted);
  };

  /*  Guard: direct page access */
  if (!categoryId) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Please select a category first.
      </div>
    );
  }

  return (
    <div>
      {/* TITLE */}
      <h1 className="
          p-3 md:p-5 mb-1
          text-3xl sm:text-[60px] md:text-[60px] md:my-6 sm:my-6
          font-hnm font-bold tracking-tight capitalize">
        Recommendations
      </h1>

      {/* SORT BAR */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setShowSort(!showSort)}
          className="text-base md:text-lg font-semibold border-b border-black"
        >
          SORT
        </button>

        {showSort && (
          <div className="flex gap-3 mt-3 flex-wrap">
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


      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
  {sortedRecs.length > 0 ? (
    sortedRecs.map((product) => (
      <ProductCard
        key={product.id}
        product={{
          ...product,
          images: product.thumbnail_url
            ? [{ images: product.thumbnail_url }]
            : [],
        }}
        disableHover={true}
      />
    ))
  ) : (
    <p className="col-span-full text-center text-gray-500">
      No recommendations found.
    </p>
  )}
</div>

    </div>
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

export default Recommendations;
