import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { URL } from "../../App";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const schema = yup.object().shape({
  testDate: yup.string().required("Date is required"),
  result: yup.string().required("Result is required"),
});

const UpdateTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearAuthState } = useRole();

  const [toastOpen, setToastOpen] = useState(false);
  const [learners, setLearners] = useState([]);
  const [learnerId, setLearnerId] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [initialValues, setInitialValues] = useState(null);

  const resultOptions = ["Pass", "Fail", "Scheduled"];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedLearnerDetails = learners.find((l) => l._id === learnerId);
  const formatDate = (isoDate) => (isoDate ? isoDate.split("T")[0] : "");

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const response = await axios.get(`${URL}/api/user/learners`, {
          withCredentials: true,
        });
        setLearners(response.data.learners || []);
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
        setErrorMessages([error.message || "Failed to fetch learners"]);
        setTimeout(() => setErrorMessages([]), 4000);
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
        setLearnerId(test.learnerId?._id || "");
        setSearchTerm(test.learnerId?.fullName || "");
        setSelectedTest(test.testType || "");

        const init = {
          testDate: formatDate(test.date),
          result: test.result,
        };

        setInitialValues(init);
        setValue("testDate", init.testDate);
        setValue("result", init.result);
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
        setErrorMessages([error.message || "Failed to fetch test"]);
        setTimeout(() => setErrorMessages([]), 4000);
      }
    };
    if (id) fetchTest();
  }, [id]);

  const onSubmit = async (data) => {
    const hasChanged =
      initialValues?.testDate !== data.testDate ||
      initialValues?.result !== data.result;

    if (!hasChanged) {
      setErrorMessages(["No changes detected. Please modify before updating."]);
      return setTimeout(() => setErrorMessages([]), 4000);
    }

    try {
      setLoading(true);
      await axios.put(
        `${URL}/api/tests/${id}`,
        {
          learnerId,
          testType: selectedTest,
          date: data.testDate,
          result: data.result,
        },
        { withCredentials: true }
      );

      reset();
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
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

  return (
    <div className="p-4 sm:p-6">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Update Test Details</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full gap-6">
        <div className="flex flex-col flex-grow gap-6 lg:flex-row">
          <div className="flex flex-col w-full gap-4 text-sm lg:w-3/4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                disabled
                className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
              />
              <label className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2 left-2">
                Learner name
              </label>
            </div>

            <div className="relative w-full">
              <input
                type="text"
                value={selectedTest}
                disabled
                className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
              />
              <label className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2 left-2">
                Test type
              </label>
            </div>

            <div className="relative w-full">
              <input
                type="date"
                id="testDate"
                {...register("testDate")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md peer"
              />
              <label
                htmlFor="testDate"
                className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 bg-white top-2 left-2"
              >
                Date
              </label>
              {errors.testDate && <p className="mt-1 text-sm text-red-600">{errors.testDate.message}</p>}
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
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{res}</span>
                  </label>
                ))}
              </div>
              {errors.result && <p className="mt-1 text-sm text-red-600">{errors.result.message}</p>}
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
            disabled={loading}
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
