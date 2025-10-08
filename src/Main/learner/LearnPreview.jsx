import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import SingleTest from "../../Main/test/SingleTest";
import SinglePayment from "../../Main/payment/SinglePayment";
import SingleCourseAssign from "../../Main/courseAssigned/SingleCourseAssign";
import SingleAttendance from "../attendance/learner/SingleAttendance";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust path as needed
import branchHeaders from "../../Components/utils/headers.jsx";

// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>
);
const LearnPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {role, user,setUser,setRole,clearAuthState} =  useRole();
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const response = await axios.get(`${URL}/api/v3/learner/${id}`, branchHeaders());
        setLearner(response.data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data?.message ===
                "Credential Invalid or Expired Please Login Again")
          ) {
            setErrorMsg("Credential Invalid or Expired Please Login Again");
            return setTimeout(() => {
              clearAuthState();
              // setErrorMsg("")
            }, 2000);
          }

          // ✅ Handle custom error messages
          const errorData = error?.response?.data;
          const errors = errorData?.errors || errorData?.message || "An error occurred";

          if (Array.isArray(errors)) {
            setErrorMsg(errors.join(", "));
          } else {
            setErrorMsg(errors);
          }

          // ✅ Auto-clear error toast
          setTimeout(() => {
            setErrorMsg("");
          }, 4000);
        }
      
      } finally {
        setLoading(false);
      }
    };

    fetchLearner();
  }, [id, navigate]);

  const handleNavigation = (path, data) => {
    navigate(path, { state: data });
    setIsOpen(false);
  };

  const profileImage = learner?.photo
    ? `${URL}/api/image-proxy/${extractDriveFileId(learner.photo)}`
    : null;

  const personalDetails = [
    { label: "Full Name", value: learner?.fullName },
    { label: "Father's Name", value: learner?.fathersName },
    { label: "Mobile Number", value: learner?.mobileNumber },
    { label: "Gender", value: learner?.gender },
    {
      label: "Date of Birth",
      value: learner?.dateOfBirth
        ? moment(learner.dateOfBirth).format("DD-MM-YYYY")
        : "",
    },
    { label: "Blood Group", value: learner?.bloodGroup },
    { label: "Address", value: learner?.address },
    {
      label: "Joining Date",
      value: learner?.createdAt
        ? moment(learner.createdAt).format("DD-MM-YYYY")
        : "",
    },
    {
      label: "Updated At",
      value: learner?.updatedAt
        ? moment(learner.updatedAt).format("DD-MM-YYYY")
        : "",
    },
    { label: "License Number", value: learner?.licenseNumber },
    { label: "LLR Number", value: learner?.llrNumber },
    { label: "Admission Number", value: learner?.admissionNumber },
  ];

  if (loading) {
    return (
         <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>

      // <div className="p-10 text-lg font-medium text-center text-gray-600">
      //   Loading learner details...
      // </div>
    );
  }
return (
  <div className="px-0 ">
        {errorMsg && <Toast message={errorMsg} />}

    <section className="flex flex-col p-5 mx-auto mb-20 space-y-10 bg-white rounded-t-lg shadow-sm max-w-screen-2xl">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)}>
            <i className="text-xl fa-solid fa-arrow-left-long"></i>
          </button>
          <h3 className="text-2xl font-semibold">Learner Details</h3>
        </div>
        <button
          onClick={() =>
            navigate(`/learner/profile/${learner.admissionNumber}/${learner._id}/edit`)
          }
          className="px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Edit
        </button>
      </div>

      {/* Top Section: Profile + Info */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className=" w-full   bg-gray-300 border-2 rounded-lg min-h-[30rem] md:min-h-[30rem] flex items-center justify-center">
          <div className="relative flex flex-col items-center w-full h-full just bg-slate-50">
            <div className="h-[40%] md:h-[40%] w-full bg-blue-100 rounded-t-lg" />
            <div className="absolute top-[20%] md:top-[25%] flex flex-col items-center space-y-4">
              {profileImage && (
                <img
                  src={profileImage}
                  alt={`${learner.fullName}'s profile`}
                  className="object-cover w-56 h-56 border-4 border-white rounded-full shadow-md"
                />
              )}
              <div className="space-y-2 text-center">
                <h1 className="text-lg font-semibold break-words">
                  {learner?.fullName}
                </h1>
                <h6 className="text-xs font-medium text-gray-700 break-words">
                  {learner?.admissionNumber}
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Details + Dropdown */}
        <div className="relative col-span-2 p-6 space-y-5 border-2 rounded-lg md:p-8">
          <h3 className="text-lg font-semibold">Personal details</h3>

          <div className="absolute top-1 right-4">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center w-32 h-10 gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm md:h-10 md:w-full hover:bg-gray-50"
            >
              Generate Form & Certificate
            </button>

            {isOpen && (
              <div className="absolute right-0 z-50 w-56 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="py-1">
                  {[
                    { label: "Form 14 Register", path: "/form" },
                    { label: "Form 15", path: "/form15" },
                    { label: "Driving Certificate Form 5", path: "/Driving5" },
                  ].map(({ label, path }) => (
                    <button
                      key={label}
                      onClick={() => handleNavigation(path, learner)}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <table className="w-full text-xs text-left text-gray-600 md:text-sm">
            <tbody>
              {personalDetails.map(({ label, value }) => (
                <tr key={label} className="align-top">
                  <td className="px-4 py-3 font-medium text-gray-800">{label}</td>
                  <td className="px-4 py-3">{value || "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-Sections */}
      {[SingleCourseAssign, SingleTest, SinglePayment, SingleAttendance].map(
        (Component, index) => (
          <div
            key={index}
            className="p-6 space-y-5 border-2 rounded-lg md:p-8"
          >
            <section>
              <Component />
            </section>
          </div>
        )
      )}
    </section>
  </div>
);

};

export default LearnPreview;
