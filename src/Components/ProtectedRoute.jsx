import React from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "./AuthContext/AuthContext";
import SplashScreen from './SplashScreen'
const ProtectedRoute = ({ allowedRoles, children }) => {
      const {role, isLoading,user,setUser,setRole,clearAuthState} =  useRole();

  // Wait until loading finishes
   if (isLoading) {
    return <SplashScreen />; // ✅ Show loading screen
  }

  if (!role || !allowedRoles.includes(role.toLowerCase())) {
    return clearAuthState ();
  //  return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
