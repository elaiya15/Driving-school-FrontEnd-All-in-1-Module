import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const OwnerLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // When path starts with /owner → remove branchId from sessionStorage
    if (location.pathname.startsWith("/owner")) {
      sessionStorage.removeItem("branchId");
    }
  }, [location]);

  return children;
};

export default OwnerLayout;
