import { useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import SuccesAnimation from './SuccesAnimation.json';
const PaymentSuccess = () => {
  const query = new URLSearchParams(useLocation().search);
  const paymentId = query.get("payment_id")||"demo12345";
  const orderId = query.get("order_id")||"order_demo12345";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
  <h1 className="text-2xl md:text-3xl font-bold text-green-600">
    ✅ Payment Successful
  </h1>

  {/* Lottie Animation */}
  <div className="w-40 h-40 md:w-72 md:h-64 mt-4">
    <Lottie animationData={SuccesAnimation} loop={true} />
  </div>

  {/* Success Message */}
  <p className="mt-4 text-base md:text-lg text-gray-700 max-w-md">
    Thank you for subscribing! Your payment was successful.
  </p>

  {/* Payment Details Box */}
  <div className="mt-6 w-full max-w-md bg-white shadow-md rounded-lg p-4 text-left">
    <p className="text-sm md:text-base">
      <strong>Payment ID:</strong> {paymentId}
    </p>
    <p className="text-sm md:text-base mt-2">
      <strong>Order ID:</strong> {orderId}
    </p>
  </div>

  {/* Button */}
  <a
    href="/"
    className="mt-6 inline-block w-full md:w-auto px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
  >
    Go to Dashboard
  </a>
</div>

  );
};

export default PaymentSuccess;
