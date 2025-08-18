import { useState, useEffect } from "react";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const AddTest = () => {
  const navigate = useNavigate();
      const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [learners, setLearners] = useState([]);
  const [testType, setTestType] = useState("");
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [testDate, setTestDate] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results] = useState(["Scheduled", "Pass", "Fail"]);
  const [selectedResult, setSelectedResult] = useState("");
  const [dataloading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        
        const response = await axios.get(`${URL}/api/user/learners`, {
         withCredentials: true,
        });

        setLearners(response.data.learners);
      } catch (error) {
      setErrors(error.message);
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Credential Invalid or Expired Please Login Again")
          ) {
            setTimeout(() => {
             clearAuthState();
              // navigate("/");
            }, 2000);
          }
      }
    };
    fetchLearners();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedLearner)
      newErrors.selectedLearner = "Please select a learner.";
    if (!setTestType) newErrors.setClassType = "Please select a test type.";
    if (!testDate) newErrors.testDate = "Please select a valid test date.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

   
    const testData = {
      learnerId: selectedLearner,
      testType: testType,
      date: new Date(testDate).toISOString(),
      result: selectedResult,
    };

    try {
              setDataLoading(true)

      await axios.post(`${URL}/api/tests`, testData, {
       withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
                setDataLoading(false)

        setToastOpen(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          return setTimeout(() => {
            clearAuthState();
            // navigate("/");
          }, 2000);
        }
      }
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
      <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
        Add Test Details
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-6 w-full"
      >
        <div className="w-full lg:w-3/4 flex flex-col gap-4">
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
              Select Learner
            </label>

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`w-full h-12 px-2.5 pt-4 pb-2.5 text-left text-sm bg-white border rounded-md appearance-none focus:outline-none focus:ring-0
      ${
        selectedLearnerDetails
          ? "border-blue-500 text-gray-900"
          : "border-gray-300 text-gray-500"
      }`}
            >
              {selectedLearnerDetails?.fullName || ""}
            </button>

            {isOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 shadow-lg rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full p-3 text-sm border-b border-gray-200 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((learner) => (
                      <button
                        key={learner._id}
                        type="button"
                        onClick={() => {
                          setSelectedLearner(learner._id);
                          setIsOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
          </div>
          {errors.selectedLearner && (
            <p className="text-red-500 text-sm mt-1">
              {errors.selectedLearner}
            </p>
          )}
          {selectedLearnerDetails && (
            <div className="block lg:hidden w-full border p-4 rounded-md">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={`${URL}/api/image-proxy/${extractDriveFileId(
                    selectedLearnerDetails.photo
                  )}`}
                  alt={selectedLearnerDetails.fullName}
                  className="w-14 h-14 rounded-full border"
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

          <div className="relative w-full">
            <label
              className={`
      absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
      ${
        testType || isTestDropdownOpen
          ? "text-xs -top-2.5 text-blue-600"
          : "top-3 text-sm text-gray-500"
      }
    `}
            >
              Select test type
            </label>

            <button
              type="button"
              onClick={() => setIsTestDropdownOpen((prev) => !prev)}
              className={`
      w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500
      ${
        testType || isTestDropdownOpen
          ? "border border-blue-600"
          : "border border-gray-300 text-gray-700"
      }
    `}
            >
              {testType}
            </button>

            {isTestDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="max-h-60 overflow-y-auto">
                  {["Theory Test", "Practical Test"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTestType(type);
                        setIsTestDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errors.testType && (
              <p className="text-red-500 text-sm mt-1">{errors.testType}</p>
            )}
          </div>

          <div className="relative w-full">
            <input
              type="date"
              id="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="peer w-full h-12 px-2.5 pt-4 pb-1.5 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder=" "
              required
            />
            <label
              htmlFor="date"
              className="absolute text-sm text-gray-500 bg-white px-1 transition-all duration-200 transform scale-75 -translate-y-3 top-1.5 left-2.5 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-1.5 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
            >
              Date
            </label>
            {errors.testDate && (
              <p className="text-red-500 text-sm mt-1">{errors.testDate}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2">Result</label>
            <div className="flex flex-col gap-3">
              {results.map((result) => (
                <label key={result} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="result"
                    value={result}
                    checked={selectedResult === result}
                    onChange={() => setSelectedResult(result)}
                    className="w-3 h-3"
                  />
                  <span>{result}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-full lg:w-1/4">
          {selectedLearnerDetails && (
            <div className="w-full border p-4 rounded-md">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={`${URL}/api/image-proxy/${extractDriveFileId(
                    selectedLearnerDetails.photo
                  )}`}
                  alt={selectedLearnerDetails.fullName}
                  className="w-16 h-16 rounded-full border"
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

      <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
        <button
  onClick={() => navigate(-1)}
  disabled={dataloading}
  className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 
    ${dataloading ? "opacity-50 cursor-not-allowed" : ""}`}
>
  Back
</button>
   {dataloading? (<button disabled type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800">
<svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
</svg>Loading...</button>
):( <button
            type="submit"
              onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Save
          </button>)}
         
        </div>

      {toastOpen && (
        <div
          id="toast-success"
          className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md"
          role="alert"
        >
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-700 bg-green-100 rounded-md dark:bg-green-800 dark:text-green-400">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
          <div className="ms-3 text-sm font-normal">
            Test added successfully
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTest;
