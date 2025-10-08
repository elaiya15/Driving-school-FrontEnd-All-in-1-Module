import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { URL } from "../../../App";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext";
import branchHeaders from "../../../Components/utils/headers.jsx";

const schema = yup.object().shape({
  selectedLearner: yup.string().required("Please select a learner"),
  assignedCourses: yup.string().required("Please select a course"),
  classType: yup.string().required("Please select class type"),
  date: yup.string().required("Date is required"),
  checkIn: yup.string().required("Check-in time is required"),
  checkOut: yup
    .string()
    .required("Check-out time is required")
    .test("is-after", "Check-out must be after check-in", function (value) {
      const { checkIn } = this.parent;
      return !checkIn || !value || checkIn < value;
    }),
  description: yup.string(),
});

const MarkLearner = () => {
  const { role, clearAuthState } = useRole();
  const navigate = useNavigate();

  const [learners, setLearners] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [selectedLearnerDetails, setSelectedLearnerDetails] = useState(null);
  const [searchLearner, setSearchLearner] = useState("");
  const [courseError, setCourseError] = useState("");
  const [selectedAssignedCourseId, setSelectedAssignedCourseId] = useState("");
  const [selectedAssignedId, setSelectedAssignedId] = useState("");
  const [classType, setClassType] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastError, setToastError] = useState([]);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setValue("selectedLearner", selectedLearner);
    setValue("assignedCourses", selectedAssignedCourseId);
    setValue("classType", classType);
  }, [selectedLearner, selectedAssignedCourseId, classType, setValue]);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const res = await axios.get(`${URL}/api/v2/learner`, {
          ...branchHeaders(),
        });
        setLearners(res.data.learners);
      } catch (err) {
        if (!axios.isCancel(err)) {
          if (
            err.response &&
            (err.response.status === 401 ||
              err.response.data.message === "Invalid token")
          ) {
            setTimeout(() => clearAuthState(), 3000);
          }
        }
      }
    };

    fetchLearners();
  }, [role]);

  const handleLearnerChange = async (learnerId) => {
    const selected = learners.find((l) => l._id === learnerId);
    setSelectedLearner(learnerId);
    setSelectedLearnerDetails(selected);
    setSelectedAssignedCourseId("");
    setAssignedCourses([]);
    setCourseError("");

    if (learnerId) {
      try {
        const res = await axios.get(
          `${URL}/api/v2/course-assigned/${learnerId}`,
          {
            ...branchHeaders(),
          }
        );
        const assignments = res.data.assignments;
        if (!assignments || assignments.length === 0) {
          setCourseError("No course assigned for this learner");
          setAssignedCourses([]);
        } else {
          setAssignedCourses(assignments);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          if (
            err.response &&
            (err.response.status === 401 ||
              err.response.data.message === "Invalid token")
          ) {
            setTimeout(() => clearAuthState(), 3000);
          }
        }
      }
    }
  };

  const onSubmit = async (data) => {
    //     console.log(selectedLearner);

    //    if (!selectedLearner || !selectedAssignedCourseId || !classType) {
    //   const newErrors = {};
    //   if (!selectedLearner) newErrors.selectedLearner = { message: "Please select a learner" };
    //   if (!selectedAssignedCourseId) newErrors.assignedCourses = { message: "Please select a course" };
    //   if (!classType) newErrors.classType = { message: "Please select class type" };

    //   setToastError(newErrors);
    //   // setTimeout(() => setToastError({}), 4000);
    //   return;
    // }

    setApiError("");
    setLoading(true);

    try {
      const checkInDate = new Date(`${data.date}T${data.checkIn}:00`);
      const checkOutDate = new Date(`${data.date}T${data.checkOut}:00`);

      const requestBody = {
        learner: selectedLearner,
        courseType: selectedAssignedCourseId,
        classType,
        date: data.date,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        descriptions: data.description,
      };

      if (selectedOption === "ready-to-test") {
        requestBody.readytotest = {
          _id: selectedAssignedId,
          courseId: selectedAssignedCourseId,
          statusOne: "Completed",
          statusTwo: "Ready to test",
        };
      } else if (selectedOption === "extra-class") {
        requestBody.Extraclass = {
          _id: selectedAssignedId,
          courseId: selectedAssignedCourseId,
          statusOne: "Completed",
          statusTwo: "Extra class",
        };
      }

      await axios.post(`${URL}/api/v2/learner-attendance`, requestBody, {
        ...branchHeaders(),
      });

      setToastOpen(true);
      // reset();
      setSelectedLearner("");
      setSelectedLearnerDetails(null);
      setSelectedAssignedCourseId("");
      setClassType("");
      setSelectedOption("");

      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (
        status === 401 ||
        message === "Credential Invalid or Expired Please Login Again"
      ) {
        setErrorMessages(["Credential Invalid or Expired Please Login Again"]);
        return setTimeout(() => {
          clearAuthState();
          navigate("/");
        }, 2000);
      }

      if (status === 403) {
        // Handle 403 Forbidden
        const forbiddenMsg =
          "You do not have permission to perform this action.";
        setErrorMessages([message ||forbiddenMsg]);
        return setTimeout(() => setErrorMessages([]), 4000);
      }

      const errorMsg =
        error?.response?.data?.errors || error?.message || "An error occurred";
      const messages = Array.isArray(errorMsg) ? errorMsg : [errorMsg];
      console.log(errorMsg);

      setErrorMessages(messages);
      setTimeout(() => setErrorMessages([]), 4000);
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = learners.filter((learner) =>
    learner.fullName.toLowerCase().startsWith(searchLearner.toLowerCase())
  );

  const Completed = assignedCourses.filter(
    (f) => f.totalDays === f.attendedDays || f.statusOne === "Completed"
  );

  const NotCompleted = assignedCourses.filter(
    (f) => f.totalDays !== f.attendedDays && f.statusOne !== "Completed"
  );

  const Course = [...NotCompleted, ...Completed];
  return (
    <div className="p-4">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
        Mark Attendance
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col w-full gap-4 lg:w-3/4">
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
              <label
                className={`
      absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
      ${
        selectedLearner || isLearnerOpen
          ? "text-xs -top-2.5 text-blue-600"
          : "top-3 text-sm text-gray-500"
      }
    `}
              >
                Select Learner
              </label>

              <button
                type="button"
                onClick={() => setIsLearnerOpen((prev) => !prev)}
                className={`w-full h-12 px-3 pt-4 text-left text-sm rounded-lg focus:ring-2 focus:ring-blue-500
      ${
        selectedLearner || isLearnerOpen
          ? "border border-blue-600"
          : "border border-gray-300 text-gray-700"
      }
    `}
              >
                {learners.find((l) => l._id === selectedLearner)?.fullName}
              </button>
              {errors.selectedLearner && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.selectedLearner.message}
                </p>
              )}

              {isLearnerOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full p-3 text-sm border-b border-gray-200"
                    value={searchLearner}
                    onChange={(e) => setSearchLearner(e.target.value)}
                  />
                  <div className="overflow-y-auto max-h-60">
                    {filteredLearners.length > 0 ? (
                      filteredLearners.map((learner) => (
                        <button
                          key={learner._id}
                          type="button"
                          onClick={() => {
                            handleLearnerChange(learner._id);
                            setIsLearnerOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
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
            {/* {errors.selectedLearner?.message && (
  <p className="mt-1 text-sm text-red-500">{errors.selectedLearner.message}</p>
)} */}
            {courseError && (
              <p className="mt-1 text-sm text-red-500">{courseError}</p>
            )}

            <div className="relative w-full">
              <label
                className={`
      absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
      ${
        selectedAssignedCourseId || isCourseDropdownOpen
          ? "text-xs -top-2.5 text-blue-600"
          : "top-3 text-sm text-gray-500"
      }
    `}
              >
                Select Course Type
              </label>

              <button
                type="button"
                onClick={() => setIsCourseDropdownOpen((prev) => !prev)}
                className={`
      w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500
      ${
        selectedAssignedCourseId || isCourseDropdownOpen
          ? "border border-blue-600"
          : "border border-gray-300 text-gray-700"
      }
    `}
              >
                {assignedCourses.find(
                  (a) => a.course._id === selectedAssignedCourseId
                )?.course.courseName || " "}
              </button>

              {isCourseDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="overflow-y-auto max-h-60">
                    {Course.length > 0 ? (
                      Course.map((assignment) => (
                        <button
                          key={assignment._id}
                          type="button"
                          onClick={() => {
                            setSelectedAssignedCourseId(assignment.course._id);
                            setSelectedAssignedId(assignment._id);
                            setIsCourseDropdownOpen(false);
                          }}
                          disabled={
                            !(
                              assignment.totalDays ===
                                assignment.attendedDays ||
                              assignment.statusOne === "Completed" ||
                              assignment.statusOne === "Cancelled"
                            )
                          }
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {assignment.course.courseName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}
              {/* 
              {errors.selectedAssignedCourseId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.selectedAssignedCourseId}
                </p>
              )} */}
            </div>

            {errors.assignedCourses?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.assignedCourses.message}
              </p>
            )}

            <div className="relative w-full">
              <label
                className={`
      absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
      ${
        classType || isClassDropdownOpen
          ? "text-xs -top-2.5 text-blue-600"
          : "top-3 text-sm text-gray-500"
      }
    `}
              >
                Select Class Type
              </label>

              <button
                type="button"
                onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                className={`
      w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500
      ${
        classType || isClassDropdownOpen
          ? "border border-blue-600"
          : "border border-gray-300 text-gray-700"
      }
    `}
              >
                {classType}
              </button>

              {isClassDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="overflow-y-auto max-h-60">
                    {["Theory", "Practical"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setClassType(type);
                          setIsClassDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* {errors.classType && (
                <p className="mt-1 text-sm text-red-500">{errors.classType}</p>
              )} */}
            </div>
            {errors.classType?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.classType.message}
              </p>
            )}
            <div className="relative w-full">
              <textarea
                id="description"
                {...register("description")}
                className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg resize-none appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                placeholder=" "
              ></textarea>
              <label
                htmlFor="description"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
              >
                Description
              </label>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="relative w-full">
              <input
                type="date"
                id="date"
                {...register("date")}
                className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                placeholder=" "
              />
              <label
                htmlFor="date"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
              >
                Date
              </label>
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative w-full">
                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="time"
                  id="checkIn"
                  {...register("checkIn")}
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />

                <label
                  htmlFor="checkIn"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Check-In Time
                </label>
                {errors.checkIn && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.checkIn.message}
                  </p>
                )}
              </div>

              <div className="relative w-full">
                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="time"
                  id="checkOut"
                  {...register("checkOut")}
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="checkOut"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Check-Out Time
                </label>
                {errors.checkOut && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.checkOut.message}
                  </p>
                )}
              </div>
            </div>

            <div
              className={`border rounded-lg w-full transition-all duration-300 ${
                isOpen ? "ring-2 ring-blue-500" : ""
              }`}
              tabIndex="0"
            >
              <h2>
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-5 font-medium text-gray-500"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span>Additional Settings</span>
                  <svg
                    className={`w-3 h-3 transform transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </button>
              </h2>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-40 opacity-100 p-4" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-row space-x-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="ready-to-test"
                      checked={selectedOption === "ready-to-test"}
                      onChange={() => setSelectedOption("ready-to-test")}
                      className="w-4 h-4"
                    />
                    <span>Ready to test</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="extra-class"
                      checked={selectedOption === "extra-class"}
                      onChange={() => setSelectedOption("extra-class")}
                      className="w-4 h-4"
                    />
                    <span>Extra Class</span>
                  </label>
                </div>
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
            className="px-6 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 text-white rounded-md ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {toastOpen && (
        <div
          id="toast-success"
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
            <span className="sr-only">Check icon</span>
          </div>
          <div className="text-sm font-normal ms-3">
            Attendance marked successfully
          </div>
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
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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

export default MarkLearner;
