import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {  ArrowRight } from "lucide-react";
import NewInCat from "../components/NewInCat";
import SubcatBanner from "../components/SubcatBanner";
import ProductCard from "../components/ProductCard";
import { getToken } from "../utils/PrivateRoute";


const API_URL = "http://localhost:8000/api";

const CategoryPage = () => {
  const { id } = useParams();
const categoryId = Number(id || 2);

const[products,setProducts]=useState([])
  const [banners, setBanners] = useState([]);
  const [subCatBanner,SetsubCatBanner]=useState([])
const ITEMS_PER_ROW = 6;
const visibleCount =Math.floor(products.length / ITEMS_PER_ROW) * ITEMS_PER_ROW;

  const navigate = useNavigate();
const [recommendations, setRecommendations] = useState([]);
const [subCat, setSubCat] = useState([]);
const [prod, setProd] = useState([]);
const [loading, setLoading] = useState(true);

const token = getToken()

/* 1 Fetch recommendations (personalized) */
useEffect(() => {
  if (!token) return;

  axios
    .get(
      `${API_URL}/recommendations/?k=8&category_id=${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((res) => {
      setRecommendations(res.data.results);
    })
    .catch((err) =>
      console.error("Recommendation fetch error", err)
    );
}, [token, id]);


/* 2 Fetch subcategories by parent category */
useEffect(() => {
  setLoading(true);
  setProd([]);
  setSubCat([]);

  axios
    .get(`${API_URL}/sub-categories/?parent=${id}`)
    .then((res) => {
      setSubCat(res.data);
    })
    .catch((err) =>
      console.error("Sub-category fetch error", err)
    );
}, [id]);

/* 3 Fetch category products */
useEffect(() => {
  if (subCat.length === 0) {
    setLoading(false);
    return;
  }

  const ids = subCat.map((sc) => sc.id).join(",");

  axios
    .get(`${API_URL}/products/?subcategories=${ids}`)
    .then((res) => {
      setProd(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Product fetch error", err);
      setLoading(false);
    });
}, [subCat]);


const limitedRecommendations = recommendations.slice(0, 4);



  useEffect(() => {
    
      axios.get(`${API_URL}/banners/?id=${categoryId}`)
      .then((res) => setBanners(res.data))
      .catch((err) => console.error("Banner fetch error", err));

       axios.get(`${API_URL}/products/new/${categoryId}/`)
      .then((res) => {setProducts(res.data);})
      .catch((error) => {console.log("Cannot fetch New In products", error);});

      axios.get(`${API_URL}/subCatBanner/?id=${categoryId}`)
      .then((res)=>{SetsubCatBanner(res.data);})
      .catch((error)=>{console.log("Cannot fetch New In products", error)})
      

  }, [categoryId]);

 

 if (banners.length === 0) {
    return <p className="p-10">Loading...</p>;
     }
  return (
    <>
      {/* ================= FULL WIDTH HERO BANNER ================= */}
{/* ================= FULL WIDTH HERO BANNER ================= */}
<div className="relative w-screen h-[60vh] md:h-[75vh] overflow-hidden cursor-pointer">
  <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden h-[60vh] md:h-[75vh]"
    onClick={() => navigate(`/product/${banners[0].product_id}`)}>
    <img
      src={`http://localhost:8000${banners[0].image}`}
      alt={banners[0].title}
      className="w-full h-full object-cover"
    />

    <span
      onClick={() => navigate(`/product/${banners[0].product_id}`)}
      className="
        absolute bottom-[calc(10vh+40px)]
        left-[calc(60vw+70px)]
        -translate-x-[30px] md:translate-x-0
        bg-white text-black
        px-2 pl-4
        font-semibold
        text-base md:text-sm
      "
    >
      <span className="absolute top-1/2 left-1 -translate-y-1/2 w-1.5 h-1.5 bg-black" />
      Rs.{Math.round(banners[0].price)}
    </span>
  </div>
</div>

{/* ================= NEW IN SECTION (OUTSIDE BANNER) ================= */}
<div
  className="flex items-center justify-between cursor-pointer px-4 mt-5"
  onClick={() => navigate(`/NewIn/${categoryId}`)}
>
  <p className="text-lg font-hnm tracking-wide">
    NEW IN
  </p>
  <ArrowRight size={30} />
</div>



<div className="
  mt-4
  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2
  w-[70%] gap-0
  mx-auto
  px-0 lg:px-16
">
  {subCatBanner.map((subcat, index) => (
    <SubcatBanner
      key={subcat.id}
      subcat={subcat}
      align={index === 0 ? "right" : "left"}
    />
  ))}
</div>






<div className="px-4 mt-5 mb-4">
  {/* HEADER */}
  <div
    className="flex items-center justify-between cursor-pointer mb-3"
    onClick={() => navigate(`/NewIn/${categoryId}`)}
  >
    <p className="text-lg font-hnm tracking-wide">
      NEW IN
    </p>
    <ArrowRight size={30} />
  </div>

  {/* PRODUCTS */}
  <div
    className="
      flex gap-4 overflow-x-auto pb-2
      sm:grid sm:grid-cols-6 sm:overflow-visible
    "
  >
    {products.slice(0, visibleCount).map((product) => (
      <div
        key={product.id}
        className="flex-shrink-0 w-[65vw] sm:w-auto"
      >
        <NewInCat product={product} />
      </div>
    ))}
  </div>

{/* RECOMMENDED FOR YOU */}
{limitedRecommendations.length > 0 && (
  <div className="mt-10">
    <div
    className="flex items-center justify-between cursor-pointer mb-3"
    onClick={() => {
  if (!categoryId) return;
  navigate(`/recommended/${categoryId}`);
}}

  >
    <p className="text-lg font-hnm tracking-wide">
      RECOMMENDED FOR YOU
    </p>
    <ArrowRight size={30} />
  </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {limitedRecommendations.map((product) => (
  <ProductCard
    key={product.id}
    product={{
      ...product,
      images: product.thumbnail_url
        ? [{ images: product.thumbnail_url }]
        : [],
    }}
  />
))}

    </div>
  </div>
)}




</div>


     
    </>
  );
};

export default CategoryPage;
