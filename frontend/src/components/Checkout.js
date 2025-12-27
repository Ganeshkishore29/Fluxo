import React from "react";
import { Link } from "react-router-dom";

const Checkout = ({ checkoutData }) => {

  if (!checkoutData) {
    return (
      <div className="p-6 text-gray-500">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-md">
      <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">
        Checkout
      </h1>

      {/* SUMMARY */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>
Order value</span>
          <span>₹{checkoutData.items_total}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Estimated delivery fee</span>
          <span>
            {checkoutData.free_delivery ? (
              <span className="text-black-600 font-medium">FREE</span>
            ) : (
              `₹${checkoutData.delivery_fee}`
            )}
          </span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total Payable</span>
          <span>₹{checkoutData.final_total}</span>
        </div>
      </div>

      {/* FREE DELIVERY MESSAGE */}
      {!checkoutData.free_delivery && (
        <p className="text-sm text-gray-600 mt-3">
          Add items worth ₹{1999 - checkoutData.items_total} more for FREE delivery.
        </p>
      )}

      {/* ACTION */}
      <Link to="/checkout">
        <button
          className="
            w-full
            mt-6
            py-4
            bg-black
            text-white
            font-medium
            tracking-wide
            hover:bg-gray-800
            transition
          "
        >
          PROCEED TO PAYMENT
        </button>
      </Link>
    </div>
  );
};

export default Checkout;
