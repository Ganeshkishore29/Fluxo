import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CategoryPage from "./pages/CategoryPage";
import Product from "./pages/Product";
import Profile from "./pages/Profile";
import ProductList from "./pages/ProductList";
import Register from "./pages/Register";
import PrivateRoute from "./utils/PrivateRoute";
import Signup from "./components/Signup";
import Wishlist from "./pages/Wishlist";

import NewInpage from "./pages/NewInPage";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";

import SearchPage from "./pages/Search";
import ChatWidget from "./components/ChatWidget";
import PaymentSuccess from "./components/PaymentSuccess";
import Recommendations from "./pages/Recommendations";

import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      <ScrollToTop/>

      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-[105px] overflow-x-hidden">
        <Routes>
          <Route path="/" element={<CategoryPage />} />
          <Route path="/main-categories/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/product-list/:id" element={<ProductList />} />
<Route path="/profile" element={<PrivateRoute> <Profile /> </PrivateRoute> }/>
          <Route path="*" element={<p className="p-10">Page Not Found</p>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Register />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/NewIn/:categoryId" element={<NewInpage/>}/>
          <Route path='/cart' element={<CartPage/>}/>
          <Route path='/checkout' element={<Checkout/>}/>
        <Route path="/search" element={<SearchPage/>}/>
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/recommended/:categoryId" element={<Recommendations />} />

        
        </Routes>
        <ChatWidget />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
