import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import branchHeaders from "../../Components/utils/headers.jsx";

const schema = yup.object().shape({
  learner: yup.string().required("Learner is required"),
  course: yup.string().required("Course is required"),
});

const AssignCourse = () => {
  const navigate = useNavigate();
  const { clearAuthState } = useRole();
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [searchLearner, setSearchLearner] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [dataloading, setDataLoading] = useState(false);

  const learnerRef = useRef(null);
  const courseRef = useRef(null);

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (learnerRef.current && !learnerRef.current.contains(event.target)) {
        setIsLearnerOpen(false);
      }
      if (courseRef.current && !courseRef.current.contains(event.target)) {
        setIsCourseOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = branchHeaders();
        const [learnersRes, coursesRes] = await Promise.all([
          axios.get(`${URL}/api/v2/learner`, config),
          axios.get(`${URL}/api/v2/courses`, config),
        ]);
        setLearners(Array.isArray(learnersRes.data.learners) ? learnersRes.data.learners : []);
        setCourses(Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : []);
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message ===
              "Credential Invalid or Expired Please Login Again")
        ) {
          setTimeout(() => clearAuthState(), 2000);
        }
      }
    };

    fetchData();
  }, [navigate]);

  const onSubmit = async (data) => {
    setSuccess(false);
    setErrorMessages([]);
    try {
      setDataLoading(true);
        const config = branchHeaders();
      await axios.post(`${URL}/api/v2/course-assigned`, {
        learner: data.learner,
        course: [data.course],
      }, config);

      setSuccess(true);
      setSelectedLearner("");
      setSelectedCourse("");
      reset();

      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message ===
            "Credential Invalid or Expired Please Login Again")
      ) {
          setErrorMessages(["Credential Invalid or Expired Please Login Again"]);
        return setTimeout(() => clearAuthState(), 2000);
      }

      if (error.response?.status === 400 && error.response?.data?.errors) {
        setErrorMessages(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrorMessages([error.response.data.message]);
      } else {
        setErrorMessages(["Something went wrong. Try again."]);
      }

      setTimeout(() => setErrorMessages([]), 4000);
      console.error("Assignment error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const selectedLearnerDetails = learners.find((l) => l._id === selectedLearner);
  const filteredLearners = learners.filter((l) =>
    l.fullName.toLowerCase().includes(searchLearner.toLowerCase())
  );
  const filteredCourses = courses.filter((c) =>
    c.courseName.toLowerCase().includes(searchCourse.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Assign Course</h2>
        {/* Learner Preview (Mobile) */}
            {selectedLearnerDetails && (
              <div className="block w-full p-4 border rounded-md md:hidden">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(selectedLearnerDetails.photo)}`}
                    alt={selectedLearnerDetails.fullName}
                    className="border rounded-full w-14 h-14"
                  />
                  <p className="text-base font-semibold">{selectedLearnerDetails.fullName}</p>
                  <p className="text-sm text-gray-600">ID: {selectedLearnerDetails.admissionNumber}</p>
                </div>
              </div>
            )}
          &nbsp;

      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-6 md:col-span-2">
            {/* Learner Dropdown */}
            <div ref={learnerRef} className="relative w-full">
              <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  selectedLearner || isLearnerOpen ? "text-xs -top-2.5 text-blue-600" : "top-3 text-sm text-gray-500"
                }`}>
                Select Learner
              </label>
              <button
                type="button"
                onClick={() => setIsLearnerOpen((prev) => !prev)}
                className={`w-full h-12 px-3 pt-4 text-left rounded-lg ${
                  selectedLearner || isLearnerOpen ? "border border-blue-600" : "border border-gray-300 text-gray-700"
                }`}
              >
                {selectedLearnerDetails ? selectedLearnerDetails.fullName : ""}
              </button>
              {isLearnerOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search learners..."
                    className="w-full p-3 text-sm border-b border-gray-200"
                    value={searchLearner}
                    onChange={(e) => setSearchLearner(e.target.value)}
                    autoFocus
                  />
                  <div className="overflow-y-auto max-h-60">
                    {filteredLearners.length > 0 ? (
                      filteredLearners.map((l) => (
                        <button
                          key={l._id}
                          type="button"
                          onClick={() => {
                            setSelectedLearner(l._id);
                            setValue("learner", l._id);
                            setIsLearnerOpen(false);
                            setSearchLearner("");
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          {l.fullName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No learners found</p>
                    )}
                  </div>
                </div>
              )}
              {errors.learner && (
                <p className="mt-1 text-sm text-red-600">{errors.learner.message}</p>
              )}
            </div>

          

            {/* Course Dropdown */}
            <div ref={courseRef} className="relative w-full">
              <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  selectedCourse || isCourseOpen ? "text-xs -top-2.5 text-blue-600" : "top-3 text-sm text-gray-500"
                }`}>
                Select Course
              </label>
              <button
                type="button"
                onClick={() => setIsCourseOpen((prev) => !prev)}
                className={`w-full h-12 px-3 pt-4 text-left rounded-lg ${
                  selectedCourse || isCourseOpen ? "border border-blue-600" : "border border-gray-300 text-gray-700"
                }`}
              >
                {courses.find((c) => c._id === selectedCourse)?.courseName || ""}
              </button>
              {isCourseOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full p-3 text-sm border-b border-gray-200"
                    value={searchCourse}
                    onChange={(e) => setSearchCourse(e.target.value)}
                    autoFocus
                  />
                  <div className="overflow-y-auto max-h-60">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((c) => (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => {
                            setSelectedCourse(c._id);
                            setValue("course", c._id);
                            setIsCourseOpen(false);
                            setSearchCourse("");
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          {c.courseName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No courses found</p>
                    )}
                  </div>
                </div>
              )}
              {errors.course && (
                <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>
              )}
            </div>
          </div>

          {/* Learner Preview (Desktop) */}
          {selectedLearnerDetails && (
            <div className="flex-col items-center hidden gap-3 p-5 border rounded-md shadow-sm md:flex">
              <img
                src={`${URL}/api/image-proxy/${extractDriveFileId(selectedLearnerDetails.photo)}`}
                alt={selectedLearnerDetails.fullName}
                className="w-16 h-16 border rounded-full"
              />
              <p className="text-base font-semibold">{selectedLearnerDetails.fullName}</p>
              <p className="text-sm text-gray-600">ID: {selectedLearnerDetails.admissionNumber}</p>
            </div>
          )}
        </div>

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
          <button
            type="submit"
            disabled={dataloading}
            className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-800"
          >
            {dataloading ? (
              <>
                <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
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
      {success && (
        <div className="fixed p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5">
          Course assigned successfully!
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

export default AssignCourse;
