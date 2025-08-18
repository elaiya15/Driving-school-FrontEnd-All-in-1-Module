""import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { URL } from "../../../App";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext";

const schema = yup.object().shape({
  selectedLearner: yup.string().required("Learner is required"),
  assignedCourses: yup.string().required("Course is required"),
  classType: yup.string().required("Class type is required"),
  date: yup.string().required("Date is required"),
  checkIn: yup.string().required("Check-in is required"),
  checkOut: yup
    .string()
    .required("Check-out is required")
    .test("is-after", "Check-out must be after check-in", function (value) {
      const { checkIn } = this.parent;
      return !checkIn || !value || checkIn < value;
    }),
  description: yup.string().required("Description is required"),
});

const MarkLearner = () => {
  const { role, clearAuthState } = useRole();
  const navigate = useNavigate();
  const [learners, setLearners] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedLearnerDetails, setSelectedLearnerDetails] = useState(null);
  const [selectedAssignedId, setSelectedAssignedId] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedLearner = watch("selectedLearner");
  const selectedCourse = watch("assignedCourses");
  const classType = watch("classType");
  const description = watch("description");
  const date = watch("date");
  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const res = await axios.get(`${URL}/api/user/learners`, { withCredentials: true });
        setLearners(res.data.learners);
      } catch (err) {
        if (!axios.isCancel(err) && err.response?.status === 401) {
          setTimeout(() => clearAuthState(), 3000);
        }
      }
    };
    fetchLearners();
  }, [role]);

  useEffect(() => {
    if (selectedLearner) {
      const learner = learners.find((l) => l._id === selectedLearner);
      setSelectedLearnerDetails(learner);
      const fetchCourses = async () => {
        try {
          const res = await axios.get(`${URL}/api/course-assigned/${selectedLearner}`, {
            withCredentials: true,
          });
          setAssignedCourses(res.data.assignments);
        } catch (err) {
          if (!axios.isCancel(err) && err.response?.status === 401) {
            setTimeout(() => clearAuthState(), 3000);
          }
        }
      };
      fetchCourses();
    } else {
      setSelectedLearnerDetails(null);
      setAssignedCourses([]);
    }
  }, [selectedLearner]);

  const onSubmit = async (data) => {
    setApiError("");
    setLoading(true);
    try {
      const checkInDate = new Date(`${data.date}T${data.checkIn}:00`);
      const checkOutDate = new Date(`${data.date}T${data.checkOut}:00`);

      const requestBody = {
        learner: data.selectedLearner,
        courseType: data.assignedCourses,
        classType: data.classType,
        date: data.date,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        descriptions: data.description,
      };

      if (selectedOption === "ready-to-test") {
        requestBody.readytotest = {
          _id: selectedAssignedId,
          courseId: data.assignedCourses,
          statusOne: "Completed",
          statusTwo: "Ready to test",
        };
      } else if (selectedOption === "extra-class") {
        requestBody.Extraclass = {
          _id: selectedAssignedId,
          courseId: data.assignedCourses,
          statusOne: "Completed",
          statusTwo: "Extra class",
        };
      }

      await axios.post(`${URL}/api/learner-attendance`, requestBody, {
        withCredentials: true,
      });

      setToastOpen(true);
      reset();
      setSelectedLearnerDetails(null);
      setSelectedAssignedId("");
      setSelectedOption("");

      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      const message = error?.response?.data?.message;
      if (error.response?.status === 401 || message === "Credential Invalid or Expired Please Login Again") {
        setApiError(["Credential Invalid or Expired Please Login Again"])
        // return setTimeout(() => clearAuthState(), 2000);
      }
      setApiError(Array.isArray(message) ? message.join(", ") : message || "Something went wrong");
      setTimeout(() => setApiError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="p-4">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Mark Attendance</h2>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <select {...register("selectedLearner")} className="p-2 border">
        <option value="">Select Learner</option>
        {learners.map((l) => (
          <option key={l._id} value={l._id}>{l.fullName}</option>
        ))}
      </select>
      {errors.selectedLearner && <p className="text-red-500">{errors.selectedLearner.message}</p>}

      <select {...register("assignedCourses")} className="p-2 border">
        <option value="">Select Course</option>
        {assignedCourses.map((a) => (
          <option key={a._id} value={a.course._id}>{a.course.courseName}</option>
        ))}
      </select>
      {errors.assignedCourses && <p className="text-red-500">{errors.assignedCourses.message}</p>}

      <select {...register("classType")} className="p-2 border">
        <option value="">Select Class Type</option>
        <option value="Theory">Theory</option>
        <option value="Practical">Practical</option>
      </select>
      {errors.classType && <p className="text-red-500">{errors.classType.message}</p>}

      <input type="date" {...register("date")} className="p-2 border" />
      {errors.date && <p className="text-red-500">{errors.date.message}</p>}

      <input type="time" {...register("checkIn")} className="p-2 border" />
      {errors.checkIn && <p className="text-red-500">{errors.checkIn.message}</p>}

      <input type="time" {...register("checkOut")} className="p-2 border" />
      {errors.checkOut && <p className="text-red-500">{errors.checkOut.message}</p>}

      <textarea {...register("description")} className="p-2 border" placeholder="Description" />
      {errors.description && <p className="text-red-500">{errors.description.message}</p>}

      <div className="space-x-4">
        <label>
          <input
            type="radio"
            value="ready-to-test"
            checked={selectedOption === "ready-to-test"}
            onChange={() => setSelectedOption("ready-to-test")}
          /> Ready to test
        </label>
        <label>
          <input
            type="radio"
            value="extra-class"
            checked={selectedOption === "extra-class"}
            onChange={() => setSelectedOption("extra-class")}
          /> Extra class
        </label>
      </div>

      {apiError && <p className="text-red-500">{apiError}</p>}

      <button type="submit" className="p-2 text-white bg-blue-500 rounded">Submit</button>
    </form>
    </div>
  );
};

export default MarkLearner;
