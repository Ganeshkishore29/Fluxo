import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {  ArrowRight, LucideArrowBigRightDash } from "lucide-react";
import NewInCat from "../components/NewInCat";
import SubcatBanner from "../components/SubcatBanner";


const API_URL = "http://localhost:8000/api";

const CategoryPage = () => {
  const { id } = useParams();
  const categoryId = id ?? 2;
const[products,setProducts]=useState([])
  const [banners, setBanners] = useState([]);
  const [subCatBanner,SetsubCatBanner]=useState([])
const ITEMS_PER_ROW = 6;
const visibleCount =
  Math.floor(products.length / ITEMS_PER_ROW) * ITEMS_PER_ROW;

  const navigate = useNavigate();

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
      <div className=" relative w-screen h-[60vh] md:h-[75vh] overflow-hidden cursor-pointer">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden h-[60vh] md:h-[75vh]">
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
                      bg-white text-black border-white
                      px-2 pl-4 leading-none font-semibold
                      text-base md:text-sm
                      relative">
            <span className="absolute top-1/2 left-1 -translate-y-1/2 w-1.5 h-1.5 bg-black" />
            Rs.{Math.round(banners[0].price)}
          </span>
        </div>
      </div>

<div className="mt-4 grid grid-cols-1 px-auto md:grid-cols-2 w-full gap-0">
  {subCatBanner.map((subcat, index) => (
    <SubcatBanner
      key={subcat.id}
      subcat={subcat}
      align={index === 0 ? "right" : "left"}
    />
  ))}
</div>







<div className="px-4 mt-5 mb-4">
  <div
    className="flex items-center justify-between cursor-pointer"
    onClick={() => navigate(`/NewIn/${categoryId}`)}
  >
    <p className="text-lg font-hnm tracking-wide">NEW IN</p>
    <ArrowRight size={30} />
  </div>

  <div className="mt-4 grid grid-cols-2 md:grid-cols-6">
  {products.slice(0, visibleCount).map((product) => (
    <NewInCat key={product.id} product={product} />
  ))}
</div>

</div>

     
    </>
  );
};

export default CategoryPage;
