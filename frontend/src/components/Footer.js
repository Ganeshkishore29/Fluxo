import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-16">

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* DISCLAIMER */}
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide">
            Fluxo
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            This website is built strictly for
            <span className="text-white font-medium"> educational purposes </span>
            only. UI patterns and layouts are inspired by popular e-commerce
            platforms for learning and practice.
          </p>
        </div>

        {/* MOBILE: Categories + Quick Links */}
        <div className="grid grid-cols-2 gap-6 md:col-span-2">

          {/* CATEGORIES */}
          <div>
            <h3 className="font-semibold mb-3 uppercase text-sm">
              Categories
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/main-categories/1" className="hover:text-white">Men</Link></li>
              <li><Link to="/main-categories/2" className="hover:text-white">Ladies</Link></li>
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-semibold mb-3 uppercase text-sm">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/profile" className="hover:text-white">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>

        </div>

        {/* ABOUT DEVELOPER */}
        <div>
          <h3 className="font-semibold mb-3 uppercase text-sm">
            About the Developer
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Built by <span className="text-white font-medium">Ganesh Kishore S</span>,
            an aspiring Software Development Engineer with a strong interest in
            full-stack development and AI-driven applications.
          </p>

          <div className="mt-3 text-sm text-gray-400 space-y-1">
            <p>
              Email:{" "}
              <a
                href="mailto:ganeshkishores29@gmail.com"
                className="hover:text-white underline"
              >
                ganeshkishores29@gmail.com
              </a>
            </p>

            <p>
              GitHub:{" "}
              <a
                href="https://github.com/Ganeshkishore29/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white underline"
              >
                github.com/Ganeshkishore29
              </a>
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Fluxo — Educational Project Only · Built for Learning & Portfolio
      </div>

    </footer>
  );
};

export default Footer;
