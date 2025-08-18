import { useContext,useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../App";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import ForgotPassword from "../PasswordFlow/ForgotPassword";
import { useRole } from '../Components/AuthContext/AuthContext';

const LoginForm = () => {
  const {user ,role, setUser,setRole} = useContext(useRole);


  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("Learner");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // const token = localStorage.getItem("token");
 
  // useEffect(() => {
  //   if (token) {
  //     // const decodedToken = jwtDecode(token);
  //     // const user.role = decodedToken.role?.toLowerCase();
  //     if (user.role === "learner") {
  //       navigate("/learner/learnerDash");
  //     } else if (user.role === "admin") {
  //       navigate("/admin/dashboard");
  //     } else if (user.role === "instructor") {
  //       navigate("/instructor/instructorDash");
  //     }
  //   }
  // }, [token]);

  const handleRoleSelect = (role) => {
    setErrors({})
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

    try {
      const response = await axios.post(`${URL}/api/admin/login`, data);
      const { token } = response.data;

      window.localStorage.setItem("token", token);

      const decodedToken = jwtDecode(token);
      const role = decodedToken.role?.toLowerCase();

      setUser(decodedToken);
       setRole(role);
      setUsername("");
      setPassword("");
      setToastOpen(true);

      setTimeout(() => {
        setToastOpen(false);
        if (role === "learner") {
          navigate("/learner/learnerDash");
        } else if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "instructor") {
          navigate("/instructor/instructorDash");
        } else {
          setErrors((prev) => ({ ...prev, login: "Invalid role detected." }));
        }
      }, 500);
    } catch (error) {
      console.error("Login Error:", error.response?.data || error);
      setErrors((prev) => ({
        ...prev,
        login: error.response?.data?.message || "Sever unavailable try agin later",
      }));
    }
  };

  return (
    <>
      {isForgotPassword ? (
        <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
      ) : (
        <div className="w-full max-w-sm p-6 mx-auto bg-white rounded-lg" >
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
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Login as {selectedRole || "Role"}
            </button>

            {errors.login && (
              <p className="text-sm text-red-500 ">{errors.login}</p>
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
      )}
    </>
  );
};

export default LoginForm;
