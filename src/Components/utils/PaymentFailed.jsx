import { useLocation, Link } from "react-router-dom";
import React from "react";
import Lottie from "lottie-react";
import FailureAnimation from './FailedAnimation.json'; // Replace with the path to your failure animation.json';
import { useRole } from '../AuthContext/AuthContext';
const PaymentSuccess = () => {
    const { clearAuthState } = useRole();
  const query = new URLSearchParams(useLocation().search);
//   const paymentId = query.get("payment_id")||"demo12345";
//   const orderId = query.get("order_id")||"order_demo12345";
  const reason = query.get("reason") || "Payment was cancelled or failed.";
  return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
  <h1 className="text-2xl md:text-3xl font-bold text-red-600">
    Payment Failed
  </h1>
 {/* Failure Message */}
  <p className="mt-4 text-base md:text-lg text-gray-700 max-w-md">
    Oops! Something went wrong. Your payment could not be processed.
  </p>
  {/* Failure Animation */}
  <div className="w-40 h-40 md:w-60 md:h-60 mt-4">
    <Lottie animationData={FailureAnimation} loop={true} />
  </div>
 <p className="mt-4 text-lg text-gray-700">{reason}</p>
 

  {/* Payment Details Box */}
  {/* <div className="mt-6 w-full max-w-md bg-white shadow-md rounded-lg p-4 text-left">
    <p className="text-sm md:text-base">
      <strong>Payment ID:</strong> {paymentId || "N/A"}
    </p>
    <p className="text-sm md:text-base mt-2">
      <strong>Order ID:</strong> {orderId || "N/A"}
    </p>
  </div> */}

  {/* Retry + Dashboard Buttons */}
  <div className="flex flex-col justify-center items-center md:flex-row gap-4 mt-6 w-full max-w-md">

 <Link to="/pay"className="inline-block w-full md:w-auto px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
    >
      Retry Payment</Link>


 <button className="inline-block w-full md:w-auto px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition" onClick={() => {clearAuthState()}}
    >
      Logout</button>
    
    
  </div>
</div>


  );
};

export default PaymentSuccess;
