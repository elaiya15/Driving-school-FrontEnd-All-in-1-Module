import { useState } from "react";
import axios from "axios";
import { URL } from "../App";

const ForgotPassword = ({ setIsForgotPassword }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState({});
    const [toastOpen, setToastOpen] = useState(false);  
  const [successMessage, setSuccessMessage] = useState("");

  const validateMobile = () => {
    if (!mobileNumber) return "Mobile number is required.";
    if (!/^\d{10}$/.test(mobileNumber))
      return "Enter a valid 10-digit mobile number.";
    return "";
  };
  
  const handleForgotPassword = async (event) => {
    event.preventDefault();
  
    const mobileError = validateMobile();
    setErrors({ mobile: mobileError });
  
    if (mobileError) return;


    try {
      const response = await axios.post(`${URL}/api/admin/forgot-password`, {
        mobileNumber,
      });  
  
      if (response.data.success) {
        setSuccessMessage("Password reset request sent to mobile number.");
        setToastOpen(true);
        setTimeout(() => {
          setToastOpen(false);
        }, 2000);
      }
   else {
        setErrors({
          mobile: response.data.message || "Failed to send reset request.",
        });
      }
    } catch (error) {
      console.error("Forgot Password API Error:", error);
  
      setErrors({
        mobile:
          error.response?.data?.message ||
          "Something went wrong. Please try again later.",
      });
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-md p-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Forgot Password?</h2>
        <h6 className="text-sm mb-4 text-center">
          Please enter the mobile number associated with your account, and
          we&apos;ll send you an OTP to verify your identity.
        </h6>

        <form onSubmit={handleForgotPassword}>
          <div className="relative mb-4">
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="block w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mobile Number"
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm">{errors.mobile}</p>
            )}
          </div>


          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
          >
            Submit
          </button>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              className="text-blue-500 text-sm py-2 px-6"
              onClick={() => setIsForgotPassword(false)}
            >
              Back to Login
            </button>
          </div>
        </form>
        
      {toastOpen && (
        <div
          id="toast-success"
          className="fixed top-5 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md"
          role="alert"
        >
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-700 bg-white rounded-md dark:bg-green-800 dark:text-green-200">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
          <div className="ms-3 text-sm font-normal">Password reset send !!!</div>
        </div>
      )}
      </div>
    </>
  );
};

export default ForgotPassword;
