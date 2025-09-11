import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers";

const schema = yup.object().shape({
  courseName: yup
    .string()
    .required("Course Name is required.")
    .min(3, "Course Name must be at least 3 characters."),
  duration: yup
    .number()
    .typeError("Duration must be a number.")
    .positive("Duration must be a positive number.")
    .integer("Duration must be an integer.")
    .required("Duration is required."),
  practicalDays: yup
    .number()
    .typeError("Practical Days must be a number.")
    .positive("Practical Days must be a positive number.")
    .integer("Practical Days must be an integer.")
    .required("Practical Days are required."),
  theoryDays: yup
    .number()
    .typeError("Theory Days must be a number.")
    .positive("Theory Days must be a positive number.")
    .integer("Theory Days must be an integer.")
    .required("Theory Days are required."),
  fee: yup
    .number()
    .typeError("Fee must be a number.")
    .positive("Fee must be a positive number.")
    .required("Fee is required."),
});

const AddCourse = () => {
  const navigate = useNavigate();
  const { clearAuthState } = useRole();

  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
const [errorMessages, setErrorMessages] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
  setLoading(true);
  setErrorMessages([]); // Clear old errors

  try {
    await axios.post(`${URL}/api/v2/courses`, data,branchHeaders());

    setToastOpen(true); // your success toast logic
    setTimeout(() => {
      setToastOpen(false);
      reset();
      navigate(-1);
    }, 500);
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.data.message ===
          "Credential Invalid or Expired Please Login Again")
    ) {
      setErrorMessages([ "Credential Invalid or Expired Please Login Again"]);
// return console.log("return");

      return setTimeout(() => {
        clearAuthState();
      }, 2000);
    }

    // Handle validation error with custom messages
    if (
      error.response &&
      error.response.status === 400 &&
      error.response.data?.errors
    ) {
      setErrorMessages(error.response.data.errors); // ✅ Multiple errors
    } else if (
      error.response &&
      error.response.data?.message
    ) {
      setErrorMessages([error.response.data.message]); // ✅ Single message
    } else {
      setErrorMessages(["Something went wrong. Try again."]);
    }

    console.error("Error:", error);
  } finally {
    setLoading(false);

    // Auto close error toast after 4 seconds
    setTimeout(() => {
      setErrorMessages([]);
    }, 4000);
  }
};


  return (
    <>
      <div className="p-4">
        <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
          Course Enrollment
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-8">
            {[
              { name: "courseName", label: "Course Name" },
              { name: "duration", label: "Duration (Days)" },
              { name: "practicalDays", label: "Practical (Days)" },
              { name: "theoryDays", label: "Theory (Days)" },
              { name: "fee", label: "Fee" },
            ].map(({ name, label }) => (
              <div key={name} className="relative">
                <input
                  type="text"
                  id={name}
                  placeholder=" "
                  {...register(name)}
                  className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border ${
                    errors[name]
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-500 peer`}
                />
                <label
                  htmlFor={name}
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 start-1"
                >
                  {label}
                </label>
                {errors[name] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          {errorMessage && (
            <p className="mt-4 text-center text-red-500">{errorMessage}</p>
          )}

          <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
            <button
              onClick={() => navigate(-1)}
              disabled={loading}
              type="button"
              className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Back
            </button>

            <button
              disabled={loading}
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      {toastOpen && (
        <div
          className="fixed flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5"
          role="alert"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 text-green-700 bg-green-100 rounded-md shrink-0 dark:bg-green-800 dark:text-green-400">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </div>
          <div className="text-sm font-normal ms-3">
            Course added successfully
          </div>
        </div>
      )}

      {errorMessages.length > 0 && (
  <div className="fixed z-50 space-y-2 top-32 right-5">
    {errorMessages.map((msg, index) => (
      <div
        key={index}
        className="px-4 py-2 text-sm text-white bg-red-600 rounded shadow-md animate-fade-in-down"
      >
        {msg}
      </div>
    ))}
  </div>
)}

    </>
  );
};

export default AddCourse;
