import { useState } from "react";

const SignupForm = ({ role, setIsSignup, resetState }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!fullName) {
      newErrors.fullName = "Full Name is required.";
    }
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // console.log("Signup Submitted", { fullName, email, password });
    }
  };

  return (
    <>
      <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
        Signup as {role.charAt(0).toUpperCase() + role.slice(1)}
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={`w-full mt-1 p-2 border ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`w-full mt-1 p-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`w-full mt-1 p-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
        >
          Signup
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 underline hover:text-blue-800"
            onClick={() => setIsSignup(false)}
          >
            Login
          </button>
        </p>

        <button
          type="button"
          onClick={resetState}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
          Back to Role
        </button>
      </form>
    </>
  );
};

export default SignupForm;
