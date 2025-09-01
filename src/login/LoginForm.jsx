import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../App";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useRole } from '../Components/AuthContext/AuthContext';
import { setBranchSession } from "../Components/utils/BranchCookie";
const LoginForm = () => {
  const { role, user,setUser, setRole, isLoading } = useRole();
  const navigate = useNavigate();

//   const [selectedRole, setSelectedRole] = useState("Learner");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoad, setIsLoad] = useState(false);
  const [customError, setCustomError] = useState(null);

  useEffect(() => {
    setErrors({});
  }, []);

  useEffect(() => {
    if (!isLoading && role) {

          if (user.branchId) {
        setBranchSession(user.branchId);
        // localStorage.setItem("branchId", user.branchId);
      }
console.log('====================================');
console.log(role);
console.log('====================================');
      switch (role) {
    case "learner":
      navigate("/learner/LearnerDash");
      break;
    case "owner":
      navigate("/owner/dashboard");
      break;

    case "admin":
      navigate("/admin/dashboard");
      break;

    case "instructor":
      navigate("/instructor/instructorDash");
      break;

    default:
      setErrors((prev) => ({
        ...prev,
        login: "Invalid role detected.",
      }));
  }

    //   if (role === "learner") {
    //     navigate("/learner/learnerDash");
    //   } else if (role === "admin") {
    //     navigate("/admin/dashboard");
    //   }  else if (role === "instructor") {
    //     navigate("/instructor/instructorDash");
    //   }
    }
  }, [isLoading,  navigate]);

//   const handleRoleSelect = (role) => {
//     setSelectedRole(role);
//     // setErrors({});

//     setErrors((prev) => ({ ...prev, role: "" }));
//   };

  const validateFields = () => {
    let errors = {};
    if (!username.trim()) errors.username = "Username is required.";
    if (!password.trim()) errors.password = "Password is required.";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateFields()) return;
    const data = { username, password};
    setIsLoad(true);
    try {
      const response = await axios.post(`${URL}/api/user/login`, data);
      const { user } = response.data;
      const Role = user.role?.toLowerCase();
      setUser(user);
      setRole(Role);
      console.log("user info from login:", user);
      if (user.branchId) {
        console.log('user.branchId:', user.branchId);
        
        setBranchSession(user.branchId);
        // localStorage.setItem("branchId", user.branchId);
        
      }
 setCustomError(null)
    // ✅ Show toast
setToastOpen(true);

// ✅ Auto-hide toast after 5s
setTimeout(() => {
  setToastOpen(false);
}, 3000);




// ✅ Navigate after 1 second delay (optional: wait slightly so toast is seen)
setTimeout(() => {
  switch (Role) {
    case "learner":
      navigate("/learner/LearnerDash");
      break;
    case "owner":
      navigate("/owner/dashboard");
      break;

    case "admin":
      navigate("/admin/dashboard");
      break;

    case "instructor":
      navigate("/instructor/instructorDash");
      break;

    default:
      setErrors((prev) => ({
        ...prev,
        login: "Invalid role detected.",
      }));
  }
}, 2000);

// Enough delay to see toast appear

// success toast visible 3s
    } catch (error) {
      console.error("Login Error:", error.response?.data || error);
      let errMsg = error.response?.data?.message || "Server unavailable. Please try again later.";
      setCustomError(Array.isArray(errMsg) ? errMsg : [errMsg]);
      setTimeout(() => setCustomError(null), 3000); // clear error after 4s
    } finally {
      setIsLoad(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-sm p-6 mx-auto md:h-[370px] bg-white rounded-lg">
        <h2 className="mb-6 text-xl font-bold text-center">Login</h2>

      {/* <div className="inline-flex w-full mb-4 rounded-lg">
          {["Learner", "Instructor", "Admin"].map((role, index) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className={`w-full py-2 text-sm font-medium border border-gray-300 ${
                selectedRole === role
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-blue-600 hover:text-white"
              } ${
                index === 0
                  ? "rounded-l-lg"
                  : index === 2
                  ? "rounded-r-lg"
                  : ""
              }`}
            >
              {role}
            </button>
          ))}
        </div> */}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer ${
                errors.username ? "border-red-500" : ""
              }`}
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
              Username
            </label>
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
              Password
            </label>
            <div
              className="absolute cursor-pointer right-3 top-3"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              <i
                className={`fa-solid ${
                  passwordVisible ? "fa-eye" : "fa-eye-slash"
                } text-blue-800`}
              ></i>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-sm text-blue-500">
              Forgot Password?
            </button>
          </div>

          {isLoad ? (
            <button
              disabled
              type="button"
              className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 text-white me-3 animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M100 50.5908C100 78.2051..." fill="#E5E7EB" />
                <path d="M93.9676 39.0409C96.393..." fill="currentColor" />
              </svg>
              Loading...
            </button>
          ) : (
            <button
              type="submit"
              className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Login
               {/* as {selectedRole || "Role"} */}
            </button>
          )}

          {errors.login && (
            <p className="mt-2 text-sm text-red-500">{errors.login}</p>
          )}
        </form>

        {/* ✅ Error Toast */}
        {customError && (
          <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
            <ul className="text-sm list-none list-inside">
              {customError.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ Success Toast */}
        {toastOpen && (
          // <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md animate-fade-in-down">
           <div className="fixed flex items-center justify-center z-50 w-[300px] max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md  animate-fade-in-down top-5 right-5"> 
              <div className="inline-flex items-center justify-center w-8 h-8 text-green-700 bg-green-100 rounded-md">
                <i className="fa-solid fa-check"></i>
              </div>
              <div className="ml-3 text-sm font-normal">Login successful!</div>
            </div>
        )}
      </div>
    </>
  );
};

export default LoginForm;
