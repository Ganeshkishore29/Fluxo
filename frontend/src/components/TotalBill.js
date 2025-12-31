import React from "react";
import { Link } from "react-router-dom";

const TotalBill = ({ checkoutData }) => {
  if (!checkoutData) {
    return (
      <div className="p-6 text-gray-500">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="
  max-w-2xl
  mx-auto
  p-6
  border border-gray-200
  rounded-md
  bg-white
  md:sticky md:top-6
">


      {/* SUMMARY */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Order value</span>
          <span>Rs.{checkoutData.items_total}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Estimated delivery fee</span>
          <span>
            {checkoutData.free_delivery ? (
              <span className="font-medium">FREE</span>
            ) : (
              `Rs.${checkoutData.delivery_fee}`
            )}
          </span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
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
            w-full mt-6 py-4
            bg-black text-white
            font-medium tracking-wide
            hover:bg-gray-800 transition
            uppercase
          "
        >
          Continue to Checkout
        </button>
      </Link>

      {/* PAYMENT METHODS */}
      <div className="mt-5">
        <p className="text-xs text-gray-600 mb-2">
          We accept
        </p>
        <img
          src="/payment_logos.png"
          alt="Payment methods"
          className="
            h-6 sm:h-7 md:h-8
            object-contain
      
          "
        />
      </div>

      {/* INFO */}
      <p className="text-xs text-gray-600 mt-4 leading-relaxed">
        Prices and delivery costs are not confirmed until checkout.<br />
        15 days free returns. Read more about our return & refund policy.<br />
        Need help? Contact Customer Support AI Assistant.<br />
        SMS updates will be sent to your registered mobile number.
      </p>
    </div>
  );
};

export default TotalBill;