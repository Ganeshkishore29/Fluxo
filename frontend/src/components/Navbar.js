import {Search,Heart,ShoppingBag,User,Menu,X,ArrowRight} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/PrivateRoute";
import SearchPage from "../pages/Search";

const API_URL = "http://localhost:8000/api";

const Navbar=() => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [hoveredCategoryID, setHoveredCategoryID] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const categoryContainerRef = useRef(null);
  const megaMenuRef = useRef(null);
const hoverZoneRef = useRef(null);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [activeMobileCategory, setActiveMobileCategory] = useState(null);

  useEffect(() => {
    
    axios.get(`${API_URL}/main-categories/`)
      .then((res) => {
        setCategories(res.data);
        
      })
      .catch((err) => {
        console.error(err);
        
      });
  }, []);

  const token = getToken();

useEffect(() => {
  const categoryId = hoveredCategoryID || activeMobileCategory;
  if (!categoryId) {
    setSubCategories([]);
    return;
  }

  axios
    .get(`${API_URL}/sub-categories/?main_category=${categoryId}`)
    .then((res) => setSubCategories(res.data || []))
    .catch(() => setSubCategories([]));
}, [hoveredCategoryID, activeMobileCategory]);


  const currentCategory = categories.find((c) => c.id === hoveredCategoryID);
  const isAuthenticated = !!localStorage.getItem("access_token");

  const handleSubCategoryClick = () => {
    setTimeout(() => {
      setHoveredCategoryID(null);
      setIsMegaMenuOpen(false);
    }, 300);
  };


  return (
    <>
      {/* ================= STICKY HEADER ================= */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-white shadow-sm">
      <div className="w-full bg-black text-white text-center text-xs py-2 h-[40px] flex items-center justify-center">
  This project is for educational purposes only. Not intended for production use.
</div>


        <div className="h-16 flex items-center justify-between px-8 border-b border-gray-100">
          <div className="flex items-center gap-10">
            <Link to="/main-categories/2" className="text-2xl font-bold tracking-widest">
              FLUXO
            </Link>

        {/* ===== HOVER ZONE (Categories + Mega Menu together) ===== */}
<div
  ref={hoverZoneRef} className="hidden md:block"
  onMouseLeave={(e) => {
    if (
      hoverZoneRef.current &&
      e.relatedTarget instanceof Node &&
      hoverZoneRef.current.contains(e.relatedTarget)
    ) {
      return;
    }
    setHoveredCategoryID(null);
    setIsMegaMenuOpen(false);
  }}
>
  {/* ===== CATEGORY BAR ===== */}
  <div 
    ref={categoryContainerRef}
    className="hidden md:flex items-center relative group"
    onMouseEnter={() => setIsMegaMenuOpen(true)}
  >
    <ul className="flex gap-4 py-4 px-5">
      {categories.map((cat) => (
        <Link
          to={`/main-categories/${cat.id}`}
          key={cat.id}
          className="cursor-pointer pl-4 font-hnm font-medium uppercase hover:text-gray-500 transition-colors py-2 px-2"
          onMouseEnter={() => setHoveredCategoryID(cat.id)}
        >
          {cat.name}
        </Link>
      ))}
    </ul>
  </div>

  {/* ===== MEGA MENU ===== */}
  {isMegaMenuOpen && hoveredCategoryID && currentCategory && (
    <div
      ref={megaMenuRef}
      className="absolute motion-safe:animate-slideOut left-0 top-full w-[50vw] min-h-[70vh] bg-white z-[99] shadow-2xl border border-gray-200 overflow-hidden"
      onMouseEnter={() => setIsMegaMenuOpen(true)}
    >
      <div className="grid grid-cols-[35%_65%] h-full">
        {/* LEFT */}
        <div className="border-r border-gray-200 p-8 overflow-y-auto">
          <h6 className="mb-6 mt-6 font-extrabold font-hnm uppercase text-sm tracking-wider text-gray-800">
            {currentCategory.name}
          </h6>

          <ul className="flex flex-col gap-4 min-h-[200px]">
            {subCategories.length > 0 ? (
              subCategories.map((sub) => (
                <li key={sub.id}>
                  <Link
                    to={`/product-list/${sub.id}`}
                    className="text-lg font-hnm hover:text-gray-600 block py-2"
                    onMouseDown={handleSubCategoryClick}
                  >
                    {sub.name}
                  </Link>
                </li>
              ))
            ) : (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 animate-pulse rounded w-4/5" />
              ))
            )}
          </ul>
          {!token && (
<div className="border-t-2 mt-7 border-black/30 shadow-sm bg-gradient-to-b from-white to-gray-50 py-2 px-8 text-center max-w-md  rounded-b-xl">
  <p className="text-sm font-light text-black leading-relaxed ">
    Join with us to get a better experience
  </p>
  <Link 
    to="/register" 
    className="inline-block px-2 py-1 bg-black text-white text-sm hover:bg-gray-900 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md"
  >
    login / register  
  </Link>
</div>)}


        </div>

        {/* RIGHT */}
        <div className="p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
          <h4 className="mb-6 font-semibold uppercase text-sm tracking-wider text-gray-800">
            Recommended
          </h4>
        </div>
      </div>
    </div>
  )}
</div>

          </div>

        {/* RIGHT SIDEBAR */}
<div className="flex items-center gap-6">
  {/* Desktop icons */}
  <div className="hidden md:flex items-center gap-6">
   <button onClick={() => setIsSearchOpen(true)}>
  <Search size={20} />
</button>

    <Link to={'/profile'}>
      <User size={20} />
    </Link>
    <Link to="/wishlist">
      <Heart size={20} />
    </Link>
    <Link to='/cart'>
    <ShoppingBag size={20} />
    </Link>
  </div>

  {/* Mobile icons */}
  <div className="flex md:hidden items-center gap-4">
    <button onClick={() => setIsSearchOpen(true)}>
  <Search size={20} />
</button>

    <Link to='/profile'>
    <User size={20}/></Link>
    <Link to="/wishlist">
      <Heart size={20} />
    </Link>
    <Link to='/cart'><ShoppingBag size={20} /></Link>
  </div>

  {/* Hamburger */}
  <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
    <Menu size={24} />
  </button>
</div>

{/*search*/}
{isSearchOpen && (
  <div
   className="
  fixed md:absolute
  inset-0 md:inset-auto
  md:top-full md:right-0
  w-full md:w-[50vw]
  h-full md:h-[90vh]
  bg-white shadow-2xl border
  z-[150]
  flex flex-col
  transition-transform duration-300
  animate-slide-in
"

  >
    {/* Header */}
    <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
      <h3 className="font-semibold uppercase tracking-wide">
        Search
      </h3>
      <button onClick={() => setIsSearchOpen(false)}>
        <X size={20} />
      </button>
    </div>

    {/* Search Content */}
    <div className="flex-1 overflow-hidden">
      <SearchPage onClose={() => setIsSearchOpen(false)} />
    </div>
  </div>
)}




      {/* ================= MOBILE MENU ================= */}
{isMobileMenuOpen && (
  <div
    className="fixed inset-0 z-[200] bg-black/40"
    onClick={() => setIsMobileMenuOpen(false)}
  >
    <div
      className="absolute left-0 top-0 h-full w-[80%] bg-white shadow-xl p-5 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold tracking-widest">FLUXO</span>
        <button onClick={() => setIsMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>

      {/* Auth */}
      {!token && (
        <Link
          to="/login"
          onClick={() => setIsMobileMenuOpen(false)}
          className="block mb-6 text-sm font-medium underline"
        >
          Login / Register
        </Link>
      )}

      {/* Categories */}
      <ul className="flex flex-col gap-4">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              className="w-full flex justify-between items-center text-left font-semibold uppercase"
              onClick={() =>
                setActiveMobileCategory(
                  activeMobileCategory === cat.id ? null : cat.id
                )
              }
            >
              {cat.name}
              <ArrowRight
                size={16}
                className={`transition-transform ${
                  activeMobileCategory === cat.id ? "rotate-90" : ""
                }`}
              />
            </button>

         {activeMobileCategory === cat.id && (
  <ul className="mt-3 ml-3 flex flex-col gap-3">
    {subCategories.length > 0 ? (
      subCategories.map((sub) => (
        <Link
          key={sub.id}
          to={`/product-list/${sub.id}`}
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-sm text-gray-700"
        >
          {sub.name}
        </Link>
      ))
    ) : (
      <p className="text-xs text-gray-400">Loading...</p>
    )}
  </ul>
)}

          </li>
        ))}
      </ul>

      {/* Bottom icons */}
      <div className="mt-10 flex gap-6">
        <Link to="/wishlist"><Heart size={20} /></Link>
        <Link to='/cart'><ShoppingBag size={20} /></Link>
       <button onClick={() => setIsSearchOpen(true)}>
  <Search size={20} />
</button>

      </div>
    </div>
  </div>
)}
</div>

    


        
</div>
</>
)}
export default Navbar