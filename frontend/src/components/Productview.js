import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Heart, Plus } from "lucide-react";
import { getToken } from "../utils/PrivateRoute";
import SimilarProduct from "./SimilarProduct";
import { BASE_URL } from "../utils/config";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;


const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const imageScrollRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [authMessageWishlist, setAuthMessageWishlist] = useState("");
  const [authMessageCart, setauthMessageCart] = useState("")
  const [selectedSize, setSelectedSize] = useState(null);
  const [outOfStockSizes, setOutOfStockSizes] = useState([]);
  const[similarProducts,setSimilarProducts]=useState([])

  const authMessage = authMessageCart || authMessageWishlist
  const token = getToken();
useEffect(() => {
  if (!id) return;   

  axios
    .get(`${API_URL}/products/${id}/`)
    .then((res) => setProduct(res.data))
    .catch((err) => console.error("Product fetch error", err));

  axios
    .get(`${API_URL}/similar-product/${id}/`)
    .then((res) => {
      setSimilarProducts(
        Array.isArray(res.data) ? res.data : [res.data]
      );
    })
    .catch((err) => {
      console.error("API ERROR", err);
      setSimilarProducts([]);
    });
}, [id]);



useEffect(() => {
  if (!token || !id) return;

  const startTime = Date.now();

  return () => {
    const durationSeconds = Math.floor(
      (Date.now() - startTime) / 1000
    );

    axios.post(
      `${API_URL}/activity/create/`,
      {
        product_id: id,
        action: "view",
        duration_seconds: durationSeconds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).catch((err) =>
      console.error("Activity tracking error", err)
    );
  };
}, [id, token]);


  useEffect(() => {
    if (!token || !id) return;

    axios
      .get(`${API_URL}/wishlist/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLiked(res.data.liked); 
      })
      .catch(() => setLiked(false));
  }, [id, token]);

   if (!product) return <p className="p-6">Loading...</p>;

const handleWishlistToggle = async () => {
  if (!token) {
    setAuthMessageWishlist(
      <>
        Please{" "}
        <Link to="/register" className="text-red font-bold underline">
          login
        </Link>{" "}
        to use wishlist
      </>
    );
    return;
  }

  try {
    if (!liked) {
      // ADD to wishlist
      await axios.post(
        `${API_URL}/wishlist/${product.id}/toggle/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      //  LOG ACTIVITY AFTER SUCCESS
      await axios.post(
        `${API_URL}/activity/create/`,
        {
          product_id: product.id,
          action: "wishlist",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLiked(true);
    } else {
      // REMOVE from wishlist (NO activity log)
      await axios.delete(
        `${API_URL}/wishlist/${product.id}/toggle/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLiked(false);
    }
  } catch (err) {
    console.error("Wishlist toggle error", err);
  }
};
const handleAddToCart = async () => {
  if (!token) {
    setauthMessageCart(
      <>
        Please{" "}
        <Link to="/register" className="text-red font-bold underline">
          login
        </Link>{" "}
        to use cart
      </>
    );
    return;
  }

  if (!selectedSize) {
    setauthMessageCart("Please select a size first");
    return;
  }

  try {
    await axios.post(
      `${API_URL}/cart/`,
      {
        product_id: product.id,
        size_id: selectedSize.id,
        quantity: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // LOG ACTIVITY AFTER SUCCESS
    await axios.post(
      `${API_URL}/activity/create/`,
      {
        product_id: product.id,
        action: "add_cart",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setauthMessageCart("Added to cart successfully!");
  } catch (err) {
    const errorMsg = err.response?.data?.error;

    if (errorMsg) {
      setauthMessageCart(errorMsg);

      if (selectedSize) {
        setOutOfStockSizes((prev) => [
          ...new Set([...prev, selectedSize.size]),
        ]);
        setSelectedSize(null);
      }
    } else {
      setauthMessageCart("Failed to add item to cart");
    }
  }
};



    return (
      <>
      <div className="w-full md:w-screen grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2">

        {/* ================= LEFT — IMAGES ================= */}
        <div
          ref={imageScrollRef}
          className="
    md:w-[50vw]
    md:h-[calc(110vh-96px)]
    md:overflow-y-auto
    md:grid md:grid-cols-2
    md:gap-0          
    md:p-0          
  

    /* MOBILE */
    flex md:block
    overflow-x-auto md:overflow-x-hidden
    gap-2
    px-4 md:px-0
  "
        >
          {product.images.map((img, index) => {
            const total = product.images.length;
            const isFullWidth =
              index === 0 || (total >= 4 && index === total - 1);

            return (
              <img
                key={img.id}

                src={`${BASE_URL}${img.images}`}


                alt={product.name}
                className={`
          block                 
          object-cover
          md:w-full md:h-auto
          ${isFullWidth ? "md:col-span-2" : ""}

          /* MOBILE */
          min-w-[85%] h-[60vh]
          md:min-w-0 md:h-auto
        `}
              />
            );
          })}
        </div>


        {/* ================= RIGHT — DETAILS ================= */}
        <div
          className="
    md:w-[50vw]
    md:sticky md:top-24
    mt-6 md:mt-10
    px-6 md:px-[90px]
    py-8 md:py-0
  "


          style={{ overscrollBehavior: "contain" }}
          onWheelCapture={(e) => {
            if (window.innerWidth < 768) return;

            const el = imageScrollRef.current;
            if (!el) return;

            const atTop = el.scrollTop === 0;
            const atBottom =
              el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

            if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {

              el.scrollTop += e.deltaY;
            }
          }}
        >
          {/* NAME + HEART */}
          <div className="flex items-center justify-between pr-2">


            <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
              {product.name}
            </h1>


            <button
              onClick={handleWishlistToggle}
              className="ml-4 flex items-center"
            >
              <Heart
                size={25}
                className={liked ? "fill-black stroke-black" : "stroke-black"}
              />
            </button>

          </div>
          {(authMessage) && (
            <p className="text-red-500 text-sm mt-2">
              {authMessage}
            </p>
          )}


          {/* PRICE */}
          <p className="mt-4 text-xl font-semibold">Rs.{product.price}</p>
          <p className="text-sm text-gray-600">
            MRP inclusive of all taxes
          </p>

          <div className="mt-8">
            <h3 className="font-medium mb-3">Select Size</h3>
            <div className="flex gap-3 flex-wrap">

              {/* Deduplicate by size name, keep highest stock */}
              {Object.values(
                product.sizes.reduce((acc, s) => {
                  // If size already exists, keep the one with higher stock
                  if (!acc[s.size] || acc[s.size].stock < s.stock) {
                    acc[s.size] = s;
                  }
                  return acc;
                }, {})
              )
                .sort((a, b) => {
                  const order = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5, 'XXXL': 6 };
                  return (order[a.size] || 99) - (order[b.size] || 99);
                })
                .map((s) => (
                  <div key={s.size} className="relative"> {/* key by size name */}
                    <button
                      className={`border px-5 py-3 text-sm transition-all duration-200 ${selectedSize?.size === s.size
                          ? "bg-black text-white border-black shadow-md"
                          : "hover:border-gray-400 hover:shadow-sm bg-white text-gray-700"
                        } ${s.stock === 0 || outOfStockSizes.includes(s.size)
                          ? "opacity-50 cursor-not-allowed line-through"
                          : ""
                        }`}
                      disabled={s.stock === 0 || outOfStockSizes.includes(s.size)}
                      onClick={() => {
                        if (s.stock > 0 && !outOfStockSizes.includes(s.size)) {
                          setSelectedSize(s);
                          setauthMessageCart("")
                        }
                      }}

                    >
                      {s.size}
                    </button>

                    {s.stock < 3 && s.stock > 0 && (
                      <span className="absolute -top-0 -right-0 w-2 h-2 m-1 bg-red-600 " />
                    )}
                  </div>
                ))}

            </div>
          </div>


          {/* ADD TO CART */}
          <button
            className="w-[80%] mt-6 md:mb-10 mx-auto block bg-black text-white py-4 text-sm font-medium hover:bg-gray-800 shadow-lg"
            onClick={handleAddToCart}
          >
            ADD TO CART
          </button>


          {/* DESCRIPTION */}
          <div className="mt-7 border-t pt-4">
            <button
              onClick={() =>
                setOpenSection(openSection === "desc" ? null : "desc")
              }
              className="flex justify-between w-full"
            >
              <span className="font-medium">DESCRIPTION</span>
              <Plus
                size={18}
                className={openSection === "desc" ? "rotate-45" : ""}
              />
            </button>
            {openSection === "desc" && (
              <p className="mt-4 text-sm text-gray-600">
                {product.description}
              </p>
            )}
          </div>

          {/* DELIVERY */}
          <div className="mt-10 border-t pt-4">
            <button
              onClick={() =>
                setOpenSection(openSection === "delivery" ? null : "delivery")
              }
              className="flex justify-between w-full"
            >
              <span className="font-medium">
                DELIVERY, PAYMENT AND RETURNS
              </span>
              <Plus
                size={18}
                className={openSection === "delivery" ? "rotate-45" : ""}
              />
            </button>

            {openSection === "delivery" && (
              <p className="mt-4 text-sm text-gray-600">
                Delivery Time: 2–7 days<br /><br />
                Returns unavailable for hygiene-sensitive products.
              </p>
            )}
          </div>
        </div>

      </div>
<div className="mt-10">
  {/* TITLE */}
  <h1 className="mx-5 mb-3 text-lg font-hnm tracking-wide">
    Similar Items
  </h1>

  {/* PRODUCTS */}
  <div
    className="
      flex gap-4 overflow-x-auto px-4 pb-2
      sm:grid sm:grid-cols-6 sm:gap-0 sm:overflow-visible
    "
  >
    {similarProducts.map((product) => (
      <div
        key={product.id}
        className="flex-shrink-0 w-[65vw] sm:w-auto"
      >
        <SimilarProduct product={product} />
      </div>
    ))}
  </div>
</div>




</>
    );
  }

  export default ProductView;
