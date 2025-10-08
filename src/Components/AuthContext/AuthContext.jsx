// Components/AuthContext/AuthContext
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate} from "react-router-dom";
import {setBranchSession,removeBranchSession,getBranchSession} from './../utils/BranchCookie.jsx';
const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
   const navigate= useNavigate();

 const clearAuthState = async () => {
  try {
    console.log("run");
    
    await axios.post(`${import.meta.env.VITE_BACK_URL || ""}/api/user/logout`, {}, {
      withCredentials: true,
    });
  
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    setUser(null);
    setRole(null);
   removeBranchSession()

    // removeBranchCookie()
    // window.location.href = "/"; // ← Ensure redirection works across tabs
    navigate("/")
  }
};

  useEffect(() => {

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACK_URL || ""}/api/user/me`, {
          withCredentials: true,
        });
         const userData = res.data.user;
        setUser(userData);
        setRole(userData.role?.toLowerCase());

        // ✅ Check subscription from userData
      if (userData?.subscription) {
        const { status, endedAt } = userData.subscription;

        if (status !== "paid" || new Date() > new Date(endedAt)) {
          console.warn("Subscription expired or inactive.");
        //   navigate("/pay");
          return; // stop further processing
        }
      }

        // Set branchId in session if available
        if(res.data.user.branchId){
            setBranchSession(res.data.user.branchId);
        }
      } catch (error) {
        console.warn("AuthContext: Not logged in or token expired",error);
        setUser(null);
        setRole(null);
     removeBranchSession()
        navigate("/")
      } finally {
        setIsLoading(false);
       

      }
    };

    fetchUser();
  }, []);

  return (
    <RoleContext.Provider value={{ user, role, setUser, setRole, clearAuthState, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
