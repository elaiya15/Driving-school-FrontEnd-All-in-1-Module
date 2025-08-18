import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { URL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const AddTest = () => {
  const { clearAuthState } = useRole();
  const navigate = useNavigate();
const learnerDropdownRef = useRef(null);
const testTypeDropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      learnerDropdownRef.current &&
      !learnerDropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
    if (
      testTypeDropdownRef.current &&
      !testTypeDropdownRef.current.contains(event.target)
    ) {
      setIsTestDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const [learners, setLearners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);
  const [dataloading, setDataLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const schema = Yup.object().shape({
    learnerId: Yup.string().required("Please select a learner."),
    testType: Yup.string(),
    date: Yup.string().required("Please select a test date."),
    result: Yup.string().required("Please select result."),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const selectedLearner = watch("learnerId");
  const testType = watch("testType");
  const selectedResult = watch("result");

  const fetchLearners = async () => {
    try {
      const response = await axios.get(`${URL}/api/user/learners`, {
        withCredentials: true,
      });
      setLearners(response.data.learners);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const handleError = (error) => {
    if (
      error?.response?.status === 401 ||
      error?.response?.data?.message ===
        "Credential Invalid or Expired Please Login Again"
    ) {
      return setTimeout(() => {
        clearAuthState();
        navigate("/");
      }, 2000);
    }

    const errorMsg =
      error?.response?.data?.errors || error?.message || "An error occurred";
    const messages = Array.isArray(errorMsg) ? errorMsg : [errorMsg];
    setErrorMessages(messages);
    setTimeout(() => setErrorMessages([]), 4000);
  };

  const onSubmit = async (data) => {
    try {
      setDataLoading(true);
      await axios.post(`${URL}/api/tests`, data, {
        withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        reset();
        setToastOpen(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      handleError(error);
    } finally {
      setDataLoading(false);
    }
  };

  const filteredOptions = learners.filter((learner) =>
    learner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLearnerDetails = learners.find(
    (learner) => learner._id === selectedLearner
  );

  return (
    <div className="p-4 sm:p-6">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Add Test Details</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-6 lg:flex-row"
      >
         {/* Learner Preview (Mobile) */}
          {selectedLearnerDetails && (
            <div className="block w-full p-4 border rounded-md lg:hidden">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={`${URL}/api/image-proxy/${extractDriveFileId(
                    selectedLearnerDetails.photo
                  )}`}
                  alt={selectedLearnerDetails.fullName}
                  className="border rounded-full w-14 h-14"
                />
                <p className="text-sm font-semibold">
                  {selectedLearnerDetails.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  ID: {selectedLearnerDetails.admissionNumber}
                </p>
              </div>
            </div>
          )}
        <div className="flex flex-col w-full gap-4 lg:w-3/4">
          {/* Learner Dropdown */}
          <div className="relative w-full" ref={learnerDropdownRef}>

            <label
              className={`absolute left-3 px-1 bg-white transition-all duration-200 ${
                selectedLearner || isOpen
                  ? "-top-2 text-xs text-blue-600"
                  : "top-3 text-gray-500"
              }`}
            >
              Select Learner
            </label>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`w-full h-12 px-2.5 pt-4 pb-2.5 text-left text-sm bg-white border rounded-md ${
                selectedLearner
                  ? "border-blue-500 text-gray-900"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {selectedLearnerDetails?.fullName || ""}
            </button>
            {isOpen && (
              <div className="absolute z-20 w-full mt-1 overflow-hidden bg-white border border-gray-300 rounded-md shadow-lg">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full p-3 text-sm border-b border-gray-200 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="overflow-y-auto max-h-60">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((learner) => (
                      <button
                        key={learner._id}
                        type="button"
                        onClick={() => {
                          setValue("learnerId", learner._id);
                          setIsOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        {learner.fullName}
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-red-500">No records found</p>
                  )}
                </div>
              </div>
            )}
            {errors.learnerId && (
              <p className="mt-1 text-sm text-red-500">{errors.learnerId.message}</p>
            )}
          </div>

         

          {/* Test Type Dropdown */}
          <div className="relative w-full" ref={testTypeDropdownRef}>

            <label
              className={`absolute left-3 bg-white px-1 transition-all duration-200 ${
                testType || isTestDropdownOpen
                  ? "text-xs -top-2.5 text-blue-600"
                  : "top-3 text-sm text-gray-500"
              }`}
            >
              Select test type
            </label>
            <button
              type="button"
              onClick={() => setIsTestDropdownOpen((prev) => !prev)}
              className={`w-full h-12 px-3 pt-4 text-left rounded-lg ${
                testType || isTestDropdownOpen
                  ? "border border-blue-600"
                  : "border border-gray-300 text-gray-700"
              }`}
            >
              {testType}
            </button>
            {isTestDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                {["Theory Test", "Practical Test"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setValue("testType", type);
                      setIsTestDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
            {errors.testType && (
              <p className="mt-1 text-sm text-red-500">{errors.testType.message}</p>
            )}
          </div>

          {/* Test Date */}
          <div className="relative w-full">
            <input
              type="date"
              {...register("date")}
              className="peer w-full h-12 px-2.5 pt-4 pb-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 bg-white px-1 transition-all transform scale-75 -translate-y-3 top-1.5 left-2.5 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-1.5 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600">
              Date
            </label>
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Result */}
          <div>
            <label className="block mb-2 font-semibold">Result</label>
            <div className="flex flex-col gap-3">
              {["Scheduled", "Pass", "Fail"].map((result) => (
                <label key={result} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={result}
                    {...register("result")}
                    checked={selectedResult === result}
                    onChange={() => setValue("result", result)}
                    className="w-3 h-3"
                  />
                  <span>{result}</span>
                </label>
              ))}
            </div>
            {errors.result && (
              <p className="mt-1 text-sm text-red-500">{errors.result.message}</p>
            )}
          </div>
        </div>

        {/* Learner Preview (Desktop) */}
        <div className="hidden w-full lg:block lg:w-1/4">
          {selectedLearnerDetails && (
            <div className="w-full p-4 border rounded-md">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={`${URL}/api/image-proxy/${extractDriveFileId(
                    selectedLearnerDetails.photo
                  )}`}
                  className="w-16 h-16 border rounded-full"
                  alt="Learner"
                />
                <p className="text-sm font-semibold">
                  {selectedLearnerDetails.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  ID: {selectedLearnerDetails.admissionNumber}
                </p>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
        <button
          onClick={() => navigate(-1)}
          disabled={dataloading}
          className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 ${
            dataloading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Back
        </button>

        {dataloading ? (
          <button
            disabled
            type="button"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-800"
          >
            <svg
              className="inline w-4 h-4 text-white me-3 animate-spin"
              viewBox="0 0 100 101"
              fill="none"
            >
              <path d="..." fill="#E5E7EB" />
              <path d="..." fill="currentColor" />
            </svg>
            Loading...
          </button>
        ) : (
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-800"
          >
            Save
          </button>
        )}
      </div>

      {/* ✅ Success Toast */}
      {toastOpen && (
        <div className="fixed z-50 p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5">
         Test added successfully
        </div>
      
      )}

      {/* ❌ Error Toasts */}
      {errorMessages.length > 0 && (
        <div className="fixed z-50 w-full max-w-xs space-y-2 top-32 right-5">
          {errorMessages.map((msg, i) => (
            <div
              key={i}
              className="flex items-center p-4 text-white bg-red-600 rounded-md shadow-md"
              role="alert"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 mr-3 text-red-600 bg-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-4h2v2h-2v-2zm0-8h2v6h-2V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddTest;
