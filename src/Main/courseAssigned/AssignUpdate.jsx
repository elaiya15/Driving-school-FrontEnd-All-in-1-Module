import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion";

const schema = yup.object().shape({
  statusOne: yup.string().required("Status is required"),
});

const AssignUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearAuthState } = useRole();

  const [assignment, setAssignment] = useState(null);
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchLearner, setSearchLearner] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [allLearner, setAllLearner] = useState(true);
  const [allCourse, setAllCourse] = useState(true);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const learnerRef = useRef(null);
  const courseRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const config = { withCredentials: true };
      const [resAssign, resLearners, resCourses] = await Promise.all([
        axios.get(`${URL}/api/course-assigned/ById/${id}`, config),
        axios.get(`${URL}/api/user/learners`, config),
        axios.get(`${URL}/api/courses`, config),
      ]);

      const data = resAssign.data;
      setAssignment(data);
      setSelectedLearner(data.learner?._id || "");
      setSelectedCourse(data.course?._id || "");
      setValue("statusOne", data.statusOne || "");
      setLearners(resLearners.data.learners || []);
      setCourses(resCourses.data.courses || []);
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.data.message ===
          "Credential Invalid or Expired Please Login Again")
    ) {
      return setTimeout(() => {
        clearAuthState();
      }, 2000);
    }
    if (
      error.response &&
      error.response.status === 400 &&
      error.response.data?.errors
    ) {
      setErrorMessages(error.response.data.errors);
    } else if (error.response?.data?.message) {
      setErrorMessages([error.response.data.message]);
    } else {
      setErrorMessages(["Something went wrong. Try again."]);
    }
    setTimeout(() => {
      setErrorMessages([]);
    }, 4000);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessages([]);
    try {
      const config = { withCredentials: true };
      await axios.put(`${URL}/api/course-assigned/${id}`, {
        learner: selectedLearner,
        course: selectedCourse,
        statusOne: data.statusOne,
      }, config);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 1500);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedLearnerDetails = learners.find((l) => l._id === selectedLearner);
  const filteredLearners = learners.filter((l) => l.fullName.toLowerCase().includes(searchLearner.toLowerCase()));
  const filteredCourses = courses.filter((c) => c.courseName.toLowerCase().includes(searchCourse.toLowerCase()));

  const statuses = ["Completed", "Processing", "Cancelled"];

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Update Course Assignment</h2>

      {assignment && (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Learner Preview (Mobile) */}
              {selectedLearnerDetails && (
                <div className="block w-full p-4 border rounded-md lg:hidden">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`${URL}/api/image-proxy/${extractDriveFileId(selectedLearnerDetails.photo)}`}
                      alt={selectedLearnerDetails.fullName}
                      className="border rounded-full w-14 h-14"
                    />
                    <p className="text-sm font-semibold">{selectedLearnerDetails.fullName}</p>
                    <p className="text-sm text-gray-600">ID: {selectedLearnerDetails.admissionNumber}</p>
                  </div>
                </div>
              )}
          <div className="flex gap-6">
            
            <div className="flex flex-col w-full gap-4 lg:w-3/4">
              {/* Learner */}
              {allLearner ? (
                <div className="relative w-full">
                  <input
                    type="text"
                    value={assignment.learner?.fullName || ""}
                    disabled
                    className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-2">
                    Learner Name
                  </label>
                </div>
              ) : (
                <div ref={learnerRef} className="relative w-full">
                  <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${selectedLearner || isLearnerOpen ? "text-xs -top-2.5 text-blue-600" : "top-3 text-sm text-gray-500"}`}>
                    Select Learner
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLearnerOpen(prev => !prev)}
                    className={`w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500 ${selectedLearner || isLearnerOpen ? "border border-blue-600" : "border border-gray-300 text-gray-700"}`}
                  >
                    {selectedLearnerDetails ? selectedLearnerDetails.fullName : "Choose a learner"}
                  </button>
                  {isLearnerOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <input
                        type="text"
                        placeholder="Search learners..."
                        className="w-full p-3 text-sm border-b border-gray-200"
                        value={searchLearner}
                        onChange={(e) => setSearchLearner(e.target.value)}
                        autoFocus
                      />
                      <div className="overflow-y-auto max-h-60">
                        {filteredLearners.length > 0 ? filteredLearners.map(learner => (
                          <button
                            key={learner._id}
                            type="button"
                            onClick={() => {
                              setSelectedLearner(learner._id);
                              setIsLearnerOpen(false);
                              setSearchLearner("");
                            }}
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                          >
                            {learner.fullName}
                          </button>
                        )) : <p className="p-4 text-gray-500">No learners found</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* <div className="flex items-end justify-end bg-amber-400"> */}
           <button type="button" onClick={() => setAllLearner(prev => !prev)} className="flex items-end justify-end text-sm text-blue-700 ">
                {allLearner ? "Change" : "Cancel"}
              </button>
              {/* </div> */}
             

              

              {/* Course */}
              {allCourse ? (
                <div className="relative w-full">
                  <input
                    type="text"
                    value={assignment.course?.courseName || ""}
                    disabled
                    className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-2">
                    Course Name
                  </label>
                </div>
              ) : (
                <div ref={courseRef} className="relative w-full">
                  <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${selectedCourse || isCourseOpen ? "text-xs -top-1 text-blue-600" : "top-3 text-sm text-gray-500"}`}>
                    Select Course
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCourseOpen(prev => !prev)}
                    className={`w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500 ${selectedCourse || isCourseOpen ? "border border-blue-600" : "border border-gray-300 text-gray-700"}`}
                  >
                    {courses.find((c) => c._id === selectedCourse)?.courseName || "Choose a course"}
                  </button>
                  {isCourseOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full p-3 text-sm border-b border-gray-200"
                        value={searchCourse}
                        onChange={(e) => setSearchCourse(e.target.value)}
                        autoFocus
                      />
                      <div className="overflow-y-auto max-h-60">
                        {filteredCourses.length > 0 ? filteredCourses.map(course => (
                          <button
                            key={course._id}
                            type="button"
                            onClick={() => {
                              setSelectedCourse(course._id);
                              setIsCourseOpen(false);
                              setSearchCourse("");
                            }}
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                          >
                            {course.courseName}
                          </button>
                        )) : <p className="p-4 text-gray-500">No courses found</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button type="button" onClick={() => setAllCourse(prev => !prev)} className="flex items-end justify-end text-sm text-blue-700">
                {allCourse ? "Change" : "Cancel"}
              </button>

              {/* Status */}
              <div>
                <label className="block mb-2 font-semibold">Status</label>
                <div className="flex flex-col gap-2">
                  {statuses.map((status) => (
                    <label key={status} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value={status}
                        {...register("statusOne")}
                        className="w-4 h-4"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
                {errors.statusOne && <p className="mt-1 text-sm text-red-600">{errors.statusOne.message}</p>}
              </div>
            </div>

            {/* Learner Preview (Desktop) */}
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

          {/* Buttons */}
          <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 text-white bg-gray-600 rounded-md"
              type="button"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white px-6 py-2 rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      )}

      {success && (
        <div className="fixed px-4 py-2 text-white bg-blue-700 rounded shadow top-20 right-5">
          Assignment updated successfully!
        </div>
      )}

      {errorMessages.length > 0 && (
        <div className="fixed px-4 py-2 space-y-1 text-sm text-white bg-red-600 rounded shadow top-32 right-5">
          {errorMessages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignUpdate;