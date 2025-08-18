import { useEffect, useState,useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const schema = yup.object().shape({
  learnerId: yup.string().required("Please select a learner."),
  paymentMethod: yup.string().required("Please select a payment method."),
  date: yup.string().required("Please select a valid payment date."),
  amount: 
  yup
    .number()
    .typeError("Amount must be a number.")
    .positive("Please enter a valid amount.")
    .required("Amount is required."),
});

const AddPayment = () => {
const dropdownRef = useRef(null);

  const { clearAuthState } = useRole();
  const navigate = useNavigate();
  const [learners, setLearners] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  const selectedLearnerId = watch("learnerId");

  useEffect(() => {
    axios
      .get(`${URL}/api/user/learners`, { withCredentials: true })
      .then((res) => setLearners(res.data.learners))
      .catch((err) => console.error("Failed to fetch learners", err));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post(`${URL}/api/payments`, data, {
        withCredentials: true,
      });

      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
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

      const errorMsg = error?.response?.data?.errors || error?.message || "An error occurred";
      const messages = Array.isArray(errorMsg) ? errorMsg : [errorMsg];
      setErrorMessages(messages);
      setTimeout(() => setErrorMessages([]), 4000);
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = learners.filter((learner) =>
    learner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLearner = learners.find((l) => l._id === selectedLearnerId);

  const handleSelection = (learner) => {
    setValue("learnerId", learner._id);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Add Payment</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col col-span-3 gap-4 lg:flex-row sm:gap-6">
         {/* Learner Mobile Preview */}
            {selectedLearner && (
              <div className="block w-full p-4 border rounded-md lg:hidden">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(selectedLearner.photo)}`}
                    alt={selectedLearner.fullName}
                    className="border rounded-full w-14 h-14"
                  />
                  <p className="text-sm font-semibold">{selectedLearner.fullName}</p>
                  <p className="text-sm text-gray-600">ID: {selectedLearner.admissionNumber}</p>
                </div>
              </div>
            )}
          <div className="flex flex-col w-full gap-4 lg:w-2/3">
            {/* Learner Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label
                className={`absolute left-3 px-1 transition-all duration-200 bg-white ${
                  watch("learnerId") || isOpen
                    ? "-top-2 text-xs text-blue-600"
                    : "top-3 text-gray-500"
                }`}
              >
                Select a Learner
              </label>

              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="block w-full h-12 px-3 pt-5 pb-2 text-left text-gray-900 border border-gray-300 rounded-lg text-medium"
              >
                {selectedLearner?.fullName || ""}
              </button>

              {isOpen && (
                <div className="absolute z-50 w-full mt-2 overflow-hidden bg-white border border-gray-300 rounded-md shadow-lg top-full">
                  <input
                    type="text"
                    placeholder="Search learner..."
                    className="w-full h-12 px-3 pt-5 pb-2 text-sm border-b border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="overflow-y-auto max-h-60">
                    {filteredLearners.length > 0 ? (
                      filteredLearners.map((learner) => (
                        <button
                          key={learner._id}
                          type="button"
                          onClick={() => handleSelection(learner)}
                          className="block w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                        >
                          {learner.fullName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}
              {errors.learnerId && <p className="text-sm text-red-500">{errors.learnerId.message}</p>}
            </div>

            

            {/* Payment Method */}
            <div className="relative">
              <select
                {...register("paymentMethod")}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm border border-gray-300 rounded-md"
              >
                <option value="" disabled hidden>
                  Payment Method
                </option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
              <label className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:text-blue-500 start-1">
                Payment Method
              </label>
              {errors.paymentMethod && <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>}
            </div>

            {/* Payment Date */}
            <div className="relative">
              <input
                type="date"
                {...register("date")}
                className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm border border-gray-300 rounded-lg"
              />
              <label className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:text-blue-500 start-1">
                Date
              </label>
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
            </div>

            {/* Amount */}
            <div className="relative">
              <input
                type="text"
                {...register("amount")}
                placeholder=" "
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm border border-gray-300 rounded-md"
              />
              <label className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:text-blue-600 start-1">
                Amount
              </label>
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Learner Desktop Preview */}
          <div className="hidden w-full lg:block lg:w-1/4">
            {selectedLearner && (
              <div className="w-full p-4 border rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(selectedLearner.photo)}`}
                    alt={selectedLearner.fullName}
                    className="w-16 h-16 border rounded-full"
                  />
                  <p className="text-sm font-semibold">{selectedLearner.fullName}</p>
                  <p className="text-sm text-gray-600">ID: {selectedLearner.admissionNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col col-span-3 gap-4 mt-6 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-6 py-3 text-white bg-blue-600 rounded-md"
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 mr-2 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>

      {/* ✅ Success Toast */}
      {successToast && (
        <div className="fixed z-50 p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5">
          Payment added successfully
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

export default AddPayment;
