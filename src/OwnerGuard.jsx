import { Navigate, Outlet } from "react-router-dom";

const OwnerGuard = () => {
  const branchId = sessionStorage.getItem("branchId");
  if (branchId) {
    // ❌ If in admin mode, block owner pages
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
};

export default OwnerGuard;