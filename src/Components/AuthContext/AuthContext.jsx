// Components/AuthContext/AuthContext
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate} from "react-router-dom";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
   const navigate= useNavigate()

 const clearAuthState = async () => {
  try {
    console.log("run");
    
    await axios.post(`${import.meta.env.VITE_BACK_URL || ""}/api/admin/logout`, {}, {
      withCredentials: true,
    });
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    setUser(null);
    setRole(null);
    // window.location.href = "/"; // ← Ensure redirection works across tabs
    navigate("/")
  }
};

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACK_URL || ""}/api/admin/me`, {
          withCredentials: true,
        });
        setUser(res.data.user);
        setRole(res.data.user.role.toLowerCase());
      } catch (error) {
        console.warn("AuthContext: Not logged in or token expired");
        setUser(null);
        setRole(null);
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
