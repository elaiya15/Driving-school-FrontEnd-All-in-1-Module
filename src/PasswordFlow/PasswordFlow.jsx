import { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";

const PasswordFlow = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(true);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  return (
    <div className="p-6 max-w-md mx-auto">
      {isForgotPassword && !isOtpVerified && (
        <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
      )}
      {!isForgotPassword && !isOtpVerified && (
        <VerifyOtp
          setIsOtpVerified={setIsOtpVerified}
          setIsForgotPassword={setIsForgotPassword}
        />
      )}
      {!isForgotPassword && isOtpVerified && (
        <ResetPassword setIsForgotPassword={setIsForgotPassword} />
      )}
    </div>
  );
};

export default PasswordFlow;
