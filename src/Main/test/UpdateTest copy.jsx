import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const UpdateTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
        const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [testDate, setTestDate] = useState("");
  const [selectedResult, setSelectedResult] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [learners, setLearners] = useState([]);
  const [learnerId, setLearnerId] = useState("");

  const result = ["Pass", "Fail", "Scheduled"];

  const formatDate = (isoDate) => (isoDate ? isoDate.split("T")[0] : "");

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const response = await axios.get(`${URL}/api/user/learners`, {
          withCredentials: true
        });
        const data = await response.json();
        setLearners(data.learners || []);
      } catch (error) {
      //  setError(error.message);
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

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`${URL}/api/tests/ById/${id}`, {
         withCredentials: true,
        });

        const test = res.data.test;
        setSearchTerm(test.learnerId?.fullName || "");
        setSelectedTest(test.testType || "");
        setTestDate(formatDate(test.date));
        setSelectedResult(test.result || "");
        setLearnerId(test.learnerId?._id || "");
      } catch (err) {
         if (!axios.isCancel(err)) {
            // setError(err.response.data.message);
        if (err.response &&(err.response.status === 401 ||err.response.data.message === "Invalid token")) {
            setTimeout(() => {
              clearAuthState();
              // navigate("/");
            }, 3000);
          }
        }
      }

    };
    if (id) fetchTest();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const Data = {
        learnerId,
        testType: selectedTest,
        date: testDate,
        result: selectedResult,
      };

      await axios.put(`${URL}/api/tests/${id}`, Data, {
       withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
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
    }
  };

  const selectedLearnerDetails = learners.find(
    (learner) => learner._id === learnerId
  );

  return (
    <div className="p-4 sm:p-6">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
        Update Test Details
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col h-full gap-6">
        <div className="flex flex-col flex-grow gap-6 lg:flex-row">
          <div className="flex flex-col w-full gap-4 text-sm lg:w-3/4">
            <div className="relative w-full">
              <input
                type="text"
                id="learner"
                value={searchTerm}
                disabled
                className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
                Learner name
              </label>
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

            <div className="relative w-full">
              <input
                type="text"
                id="testType"
                value={selectedTest}
                disabled
                className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
              />
              <label className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
                Test type
              </label>
            </div>

            <div className="relative w-full">
              <label className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2">
                Date
              </label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md peer"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Result</label>
              <div className="flex flex-col gap-3">
                {result.map((res) => (
                  <label key={res} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="testResult"
                      value={res}
                      checked={selectedResult === res}
                      onChange={(e) => setSelectedResult(e.target.value)}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{res}</span>
                  </label>
                ))}
              </div>
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

        <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5">
          <div className="inline-flex items-center justify-center w-8 h-8 text-green-700 bg-green-100 rounded-md">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </div>
          <div className="ml-3 text-sm font-normal">
            Test updated successfully
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateTest;
