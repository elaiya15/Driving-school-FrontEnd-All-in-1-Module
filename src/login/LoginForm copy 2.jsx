import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../App";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
axios.defaults.withCredentials = true;
import ForgotPassword from "../PasswordFlow/ForgotPassword";
import { useRole } from '../Components/AuthContext/AuthContext';
// import { Spinner } from "flowbite-react";
 // adjust path as needed


const LoginForm = () => {
 
  const { role, setUser, setRole, isLoading } = useRole();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("Learner");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoad, setIsLoad] = useState(false);

  // const token = sessionStorage.getItem("token");
  useEffect(() => {
    setErrors({})
  },[selectedRole])

  useEffect(() => {
    if (!isLoading && role) {
      if (role === "learner") {
        navigate("/learner/learnerDash");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "instructor") {
        navigate("/instructor/instructorDash");
      }
    }
  }, [isLoading,navigate]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrors((prev) => ({ ...prev, role: "" }));
  };
  const validateFields = () => {
    let errors = {};

    if (!username.trim()) {
      errors.username = "Username is required.";
    }
    if (!password.trim()) {
      errors.password = "Password is required.";
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateFields()) return;
    const data = { username, password, role: selectedRole };
     setIsLoad(true)
    try {
      const response = await axios.post(`${URL}/api/admin/login`, data);
      const { user } = response.data;


      const Role = user.role?.toLowerCase();
       setUser(user);
       setRole(Role);

      // setUsername("");
      // setPassword("");
      setToastOpen(true);

      setTimeout(() => {
        // setIsLoad(false)
        setToastOpen(false);
        if (Role === "learner") {
          navigate("/learner/learnerDash");
        } else if (Role === "admin") {
          navigate("/admin/dashboard");
        } else if (Role === "instructor") {
          navigate("/instructor/instructorDash");
        } else {
          setErrors((prev) => ({ ...prev, login: "Invalid role detected." }));
        }
      }, 2500);
    } catch (error) {
      console.error("Login Error:", error.response?.data || error);
      setErrors((prev) => ({
        ...prev,
        login: error.response?.data?.message || "Sever unavailable please try agin later",
      }));
    }
    finally{
        setIsLoad(false)

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

          <div className="inline-flex w-full mb-4 rounded-lg">
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
          </div>

          <form onSubmit={handleLogin} className="space-y-4 ">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 focus:border-blue-500 peer ${
                  errors.username ? "border-red-500" : ""
                }`}
                placeholder=" "
              />
              <label
                htmlFor="username"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
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
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 focus:border-blue-500 peer ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
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
              <button
                type="button"
                className="text-sm text-blue-500"
                // onClick={() => setIsForgotPassword(true)}
              >
                Forgot Password?
              </button>

              </div>
              {isLoad?(  
            <button disabled type="button"className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <svg aria-hidden="true" role="status" className="inline w-4 h-4 text-white me-3 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
            </svg>Loading...</button> ):(<button
              type="submit"
              className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Login as {selectedRole || "Role"}
            </button>) }
          
            {errors.login && (
              <p className="mt-2 text-sm text-red-500">{errors.login}</p>
            )}

          </form>
          {toastOpen && (
            <div className="fixed flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md top-10 right-5">
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
