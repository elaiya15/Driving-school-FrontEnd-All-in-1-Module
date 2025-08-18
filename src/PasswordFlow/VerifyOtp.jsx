import { useState } from "react";

const VerifyOtp = ({ setIsOtpVerified, setIsForgotPassword }) => {
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!otp) {
      newErrors.otp = "OTP is required.";
    } else if (otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsOtpVerified(true); 
    }
  };

  return (
    <>
      <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
        Verify OTP
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            OTP
          </label>
          <input
            type="text"
            id="otp"
            name="otp"
            maxLength={6}
            className={`w-full mt-1 p-2 border ${
              errors.otp ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            placeholder="Enter the 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Verify OTP
        </button>
        <button
          type="button"
          onClick={() => setIsForgotPassword(false)}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
          Back to Login
        </button>
      </form>
    </>
  );
};



export default VerifyOtp;
