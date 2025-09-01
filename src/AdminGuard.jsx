// Components/AdminGuard.jsx
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const branchId = sessionStorage.getItem("branchId");
  if (!branchId) {
    // ❌ If no branch selected, block admin pages
    // return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default AdminGuard;