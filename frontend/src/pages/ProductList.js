import ProductCard from "../components/ProductCard";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const ProductList = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
const [subCategoryName, setSubCategoryName] = useState("");

  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API_BASE_URL}/products/?sub_category_id=${id}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product fetch error", err));
    
    axios
      .get(`${API_BASE_URL}/sub-categories/${id}/`)
      .then((res) => setSubCategoryName(res.data.name))
      .catch((err) => console.error("Sub-category fetch error", err));
  }, [id]);

  return (
    
  <div >
  {/* TITLE */}
<h1
  className="
    p-3 md:p-5 mb-1
    text-3xl sm:text-4xl md:text-[60px] md:my-6
    font-hnm
    font-bold
    tracking-tight
    capitalize
  "
>
  {subCategoryName}
</h1>



  {/* PRODUCT GRID */}
  <div className="grid grid-cols-2 md:grid-cols-4 ">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
</div>

  );
};

export default ProductList;
