import { useState } from "react";
import SinginImage from "../assets/Group1.svg";
import ForgotImage from "../assets/Group2.svg";
import ForgotPassword from "../PasswordFlow/ForgotPassword";
import LoginForm from "./LoginForm";

const LoginPage = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side Image */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-white p-6 sm:p-10">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <img
            src={isForgotPassword ? ForgotImage : SinginImage}
            className="w-full h-auto rounded-lg transition-all duration-300"
            />
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex-1 flex items-center justify-center bg-blue-600 p-6 sm:p-10">
        <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          {isForgotPassword ? (
            <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
          ) : (
            <LoginForm setIsForgotPassword={setIsForgotPassword} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
