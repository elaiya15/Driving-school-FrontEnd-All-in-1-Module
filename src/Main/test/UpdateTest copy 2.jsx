// ✅ Refactored UpdateTest with react-hook-form, Yup, custom error toast, loader handling, and 401 logic

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { URL } from "../../App";

const schema = yup.object().shape({
  date: yup.string().required("Test date is required"),
  result: yup.string().oneOf(["Pass", "Fail", "Scheduled"], "Invalid result").required("Result is required"),
});

const UpdateTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearAuthState } = useRole();
  const [learners, setLearners] = useState([]);
  const [learnerId, setLearnerId] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState("");

  const resultOptions = ["Pass", "Fail", "Scheduled"];

  const formatDate = (isoDate) => (isoDate ? isoDate.split("T")[0] : "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const response = await axios.get(`${URL}/api/user/learners`, {
          withCredentials: true,
        });
        setLearners(response.data.learners || []);
      } catch (error) {
        if (
          error.response?.status === 401 ||
          error.response?.data?.message === "Credential Invalid or Expired Please Login Again"
        ) {
          return setTimeout(() => {
            clearAuthState();
            navigate("/");
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
        setLearnerId(test.learnerId?._id || "");
        setSelectedTestType(test.testType || "");
        setValue("date", formatDate(test.date));
        setValue("result", test.result);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.data?.message === "Invalid token") {
          return setTimeout(() => {
            clearAuthState();
            navigate("/");
          }, 3000);
        }
      }
    };
    if (id) fetchTest();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updated = {
        learnerId,
        testType: selectedTestType,
        date: data.date,
        result: data.result,
      };

      await axios.put(`${URL}/api/tests/${id}`, updated, {
        withCredentials: true,
      });

      setToastOpen(true);
      reset();
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message === "Credential Invalid or Expired Please Login Again"
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

  const selectedLearnerDetails = learners.find((l) => l._id === learnerId);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Update Test Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col w-full gap-4 text-sm lg:w-3/4">
            <div className="relative w-full">
  <input
    type="text"
    id="learner"
    value={searchTerm}
    disabled
    placeholder=" " // Important for peer-placeholder-shown to work
    className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
  />
  <label
    htmlFor="learner"
    className="absolute text-sm text-gray-500 bg-white px-1 transition-all duration-200 transform scale-75 -translate-y-3 top-1.5 left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-3.5 peer-placeholder-shown:translate-y-0 peer-focus:top-1.5 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
  >
    Learner name
  </label>
</div>

            <div className="relative w-full">
  <input
    type="text"
    id="testType"
    value={selectedTestType}
    disabled
    placeholder=" "
    className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
  />
  <label
    htmlFor="testType"
    className="absolute text-sm text-gray-500 bg-white px-1 transition-all duration-200 transform scale-75 -translate-y-3 top-1.5 left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-3.5 peer-placeholder-shown:translate-y-0 peer-focus:top-1.5 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600"
  >
    Test type
  </label>
</div>

            <div className="relative w-full">
              <label className="absolute px-2 text-sm text-gray-500 bg-white top-2 left-2">Date</label>
              <input
                type="date"
                {...register("date")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md peer"
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block mb-2 font-semibold">Result</label>
              <div className="flex flex-col gap-3">
                {resultOptions.map((res) => (
                  <label key={res} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value={res}
                      {...register("result")}
                      checked={res === (selectedResult || undefined)}
                      onChange={() => setSelectedResult(res)}
                      className="w-4 h-4"
                    />
                    <span>{res}</span>
                  </label>
                ))}
                {errors.result && <p className="mt-1 text-sm text-red-500">{errors.result.message}</p>}
              </div>
            </div>
          </div>

          <div className="hidden w-full lg:block lg:w-1/4">
            {selectedLearnerDetails && (
              <div className="w-full p-4 border rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(selectedLearnerDetails.photo)}`}
                    alt={selectedLearnerDetails.fullName}
                    className="w-16 h-16 border rounded-full"
                  />
                  <p className="text-sm font-semibold">{selectedLearnerDetails.fullName}</p>
                  <p className="text-sm text-gray-600">ID: {selectedLearnerDetails.admissionNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Updating..." : "Update"}
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
          <div className="ml-3 text-sm font-normal">Test updated successfully</div>
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

export default UpdateTest;
