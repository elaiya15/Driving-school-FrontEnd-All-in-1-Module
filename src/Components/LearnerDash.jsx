import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaBookOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';

import { useRole } from './AuthContext/AuthContext.jsx';
import branchHeaders from "./utils/headers.jsx";

const URL = import.meta.env.VITE_BACK_URL;

// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>);

const LearnerDashboard = () => {
  const { role, user,clearAuthState } = useRole();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${URL}/api/v2/dashboard/learner/${user.user_id}`, {
           ...branchHeaders(),
        });
        setData(res.data);
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
              setErrorMsg("")
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

     fetchDashboard();
  }, []);

  const cardClass =
    "flex items-center justify-between p-4 border-2 border-blue-400 rounded-xl bg-white shadow-sm w-full";

  const labelClass = "text-gray-600 text-sm mt-1";
  const valueClass = "text-3xl font-bold text-blue-600";

  return (
    <div className="min-h-screen p-4 bg-gray-50">
              {errorMsg && <Toast message={errorMsg} />}

      {/* <h2 className="mb-6 text-2xl font-bold text-center text-blue-600">
        Learner Dashboard
      </h2> */}

      {loading ? (
                 <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>

      ) : (
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <div className={cardClass}>
            <div>
              <p className={valueClass}>
                {data?.totalCourse ?? '--'}
              </p>
              <p className={labelClass}>Total Course</p>
            </div>
            <FaBookOpen className="text-3xl text-blue-600" />
          </div>
          <div className={cardClass}>
            <div>
              <p className={valueClass}>
                {data?.CompletedCourse ?? '--'}
              </p>
              <p className={labelClass}>Completed Course</p>
            </div>
            <FaBookOpen className="text-3xl text-blue-600" />
          </div>
          <div className={cardClass}>
            <div>
              <p className={valueClass}>
                {data?.ActiveCourse ?? '--'}
              </p>
              <p className={labelClass}>ActiveCourse </p>
            </div>
            <FaBookOpen className="text-3xl text-blue-600" />
          </div>

          <div className={cardClass}>
            <div>
              <p className={valueClass}>{data?.ActiveClasses ?? 0}</p>
              <p className={labelClass}>Over all ActiveClasses</p>
            </div>
            <FaCalendarAlt className="text-3xl text-blue-600" />
          </div>

          <div className={cardClass}>
            <div>
              <p className={valueClass}>{data?.attendedClasses ?? 0}</p>
              <p className={labelClass}>Attended Classes</p>
            </div>
            <FaCheckCircle className="text-3xl text-blue-600" />
          </div>

          <div className={cardClass}>
            <div>
              <p className={valueClass}>{data?.upcomingClasses ?? 0}</p>
              <p className={labelClass}>Upcoming Classes</p>
            </div>
            <FaClock className="text-3xl text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
