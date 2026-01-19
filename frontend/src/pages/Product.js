"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import ProductView from "../components/Productview";

const Product = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");


  if (!id) return null;

  return <ProductView id={id} />;
};

export default Product;
