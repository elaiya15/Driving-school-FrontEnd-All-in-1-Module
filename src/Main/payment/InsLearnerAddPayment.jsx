import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers.jsx";
const InsLearnerAddPayment = () => {
  const navigate = useNavigate();
      const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [isOpen, setIsOpen] = useState(false);
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  // const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        
        const response = await axios.get(`${URL}/api/v2/learner`, branchHeaders() );
        return setLearners(response.data.learners);
      } catch (error) {
         if (!axios.isCancel(error)) {
            // setError(err.response.data.message);
            // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
        //   setErrorMessages(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            // setErrorMessages("");
          }, 2000);
        }
        }
      }
    };

    fetchLearners();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedLearner)
      newErrors.selectedLearner = "Please select a learner.";
    if (!paymentMethod)
      newErrors.paymentMethod = "Please select a payment method.";
    if (!paymentDate)
      newErrors.paymentDate = "Please select a valid payment date.";
    if (!amount || amount <= 0)
      newErrors.amount = "Please enter a valid amount.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    
    const paymentData = {
      learnerId: learners.find(
        (learner) => learner.fullName === selectedLearner
      )?._id,
      paymentMethod,
      date: paymentDate,
      amount,
    };

    try {
      await axios.post(`${URL}/api/v2/payments`, paymentData, branchHeaders());

      setToastOpen(true);

      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
            // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
        //   setErrorMessages([error.response?.data?.message||error.response?.data?.error ]);
          return setTimeout(() => {
            clearAuthState();
            // setErrorMessages("");
          }, 2000);
        }
      }
    }
  };
  const handleSelection = (learner) => {
    setSelectedLearner(learner.fullName);
    setSearchTerm("");
    setIsOpen(false);
    setErrors((prevErrors) => ({ ...prevErrors, selectedLearner: "" }));
  };

  const filteredLearners = learners.filter((learner) =>
    learner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLearnerDetails = learners.find(
    (learner) => learner.fullName === selectedLearner
  );

  return (
    <>
      <div className="p-4 sm:p-6">
        <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
          Add Payment
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="flex flex-col col-span-3 gap-4 lg:flex-row sm:gap-6">
            <div className="flex flex-col w-full gap-4 lg:w-2/3">
              <div className="relative w-full">
                <label
                  className={`absolute left-3 px-1 transition-all duration-200 bg-white 
      ${
        selectedLearner || isOpen
          ? "-top-2 text-xs text-blue-600"
          : "top-3 text-gray-500"
      }
    `}
                >
                  Select a Learner
                </label>

                <button
                  type="button"
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="block w-full h-12 px-3 pt-5 pb-2 text-left text-gray-900 border border-gray-300 rounded-lg text-medium focus:ring-blue-500 focus:border-blue-500"
                >
                  {selectedLearner}
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
              </div>
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
              <div className="relative">
                <select
                  id="payment"
                  name="payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                >
                  <option value="" disabled hidden>
                    Payment Method
                  </option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
                <label
                  htmlFor="payment"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Payment Method
                </label>
                {errors.paymentMethod && (
                  <p className="text-red-500">{errors.paymentMethod}</p>
                )}
              </div>

              <div className="relative w-full">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  onFocus={(event) =>
                    (event.nativeEvent.target.defaultValue = "")
                  }
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="date"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Date
                </label>
                {errors.paymentDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.paymentDate}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  id="fee"
                  name="amount"
                  placeholder=" "
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                />
                <label
                  htmlFor="amount"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Fee
                </label>
                {errors.amount && (
                  <p className="text-red-500">{errors.amount}</p>
                )}
              </div>
            </div>

            <div className="hidden w-full lg:block lg:w-1/4">
              {selectedLearnerDetails && (
                <div className="w-full p-4 border rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`${URL}/api/image-proxy/${extractDriveFileId(
                        selectedLearnerDetails.photo
                      )}`}
                      alt={selectedLearnerDetails.fullName}
                      className="w-16 h-16 border rounded-full"
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
          </div>
        </form>
        <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 text-white bg-blue-600 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
      {toastOpen && (
        <div className="fixed flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5">
          <div className="inline-flex items-center justify-center w-8 h-8 text-green-700 bg-green-100 rounded-md shrink-0">
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
          <div className="ml-3 text-sm font-normal">
            Payment added successfully
          </div>
        </div>
      )}
    </>
  );
};

export default InsLearnerAddPayment;
