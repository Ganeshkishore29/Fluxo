"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

import { useSearchParams } from "next/navigation";

const API_URL = "http://localhost:8000/api";

const NewInpage = () => {
  const searchParams = useSearchParams();
const categoryId = searchParams.get("categoryId");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!categoryId) return;

    axios
      .get(`${API_URL}/products/new/${categoryId}/`)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((error) => {
        console.log("Cannot fetch New In products", error);
      });
  }, [categoryId]);

  return (
<> 
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
        New IN
      </h1>
  <div className="mx-0 grid grid-cols-2 md:grid-cols-4">
    {products.map((item) => (
      <ProductCard key={item.id} product={item} />
    ))}
  </div>
</>
  );
};

export default NewInpage;
