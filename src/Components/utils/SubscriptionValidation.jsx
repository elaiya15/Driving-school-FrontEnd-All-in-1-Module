import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../AuthContext/AuthContext";
import SubscriptionModal from "../utils/SubscriptionModal";

const SubscriptionValidation = ({ children }) => {
  const { user, role, isLoading } = useRole();
  const location = useLocation();
  const [showModal, setShowModal] = useState(true); // modal shows by default if condition met

  const publicPaths = ["/", "/pay", "/payment-success", "/payment-failed"];
  if (publicPaths.includes(location.pathname)) return children;

  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;

  const subscription = user?.subscription;
  const isExpired = !subscription || new Date(subscription.endedAt) < new Date();

  // Owner expired → redirect to payment
  if (role?.toLowerCase() === "owner" && isExpired) {
    return <Navigate to="/pay" replace />;
  }

  // Non-owner expired → show modal
  if (role?.toLowerCase() !== "owner" && isExpired) {
    if (!showModal) return null; // optional: hide modal if closed
    return (
      <SubscriptionModal
        message="Access temporarily held. Please contact IT Admin."
        onClose={() => setShowModal(false)}
      />
    );
  }

  // Active subscription → allow access
  return children;
};

export default SubscriptionValidation;
