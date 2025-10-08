// Components/SubscriptionValidation.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../AuthContext/AuthContext";
import SubscriptionModal from "../utils/SubscriptionModal"; // adjust import if path differs

const SubscriptionValidation = ({ children }) => {
  const { user, role, isLoading } = useRole();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  // Public routes (skip subscription validation)
  const publicPaths = ["/", "/pay", "/payment-success", "/payment-failed"];
  if (publicPaths.includes(location.pathname)) return children;

  // Wait until auth state is ready
  if (isLoading) return null;

  if (!user) return <Navigate to="/" replace />;

  const subscription = user?.subscription;
  const isExpired =
    !subscription || new Date(subscription.endedAt) < new Date();

  // Show modal only once for non-owner expired subscriptions
  useEffect(() => {
    if (role?.toLowerCase() !== "owner" && isExpired) {
      setShowModal(true);
    }
  }, [role, isExpired]);

  // 🧩 If owner’s subscription expired → redirect to payment
  if (role?.toLowerCase() === "owner" && isExpired) {
    return <Navigate to="/pay" replace />;
  }

  // 🧩 If non-owner’s subscription expired → show popup only
  if (role?.toLowerCase() !== "owner" && isExpired) {
    return (
      <>
        {showModal && (
          <SubscriptionModal
            message="Access temporarily held. Please contact IT Admin."
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // ✅ Active subscription → allow access
  return children;
};

export default SubscriptionValidation;
