import React, { useEffect, useState } from "react";
import axios from "axios";
const URL = import.meta.env.VITE_BACK_URL;
import { useRole } from "./AuthContext/AuthContext.jsx";
import branchHeaders from "./utils/headers.jsx";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { FaUsers, FaUserCheck } from "react-icons/fa";
import { ImBooks } from "react-icons/im";

// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
    {message}
  </div>
);
const DashboardAdmin = () => {
  const { role, user, setUser, setRole, clearAuthState } = useRole();
  const [errorMsg, setErrorMsg] = useState("");
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({
    totalLearners: 0,
    activeLearners: 0,
    inactiveLearners: 0,
    instructors: 0,
    staff: 0,
    courses: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (role !== "admin" && role !== "owner") {
          throw new Error(
            "Unauthorized: Only admin or owner can access this dashboard."
          );
        }

        const res = await axios.get(
          `${URL}/api/v2/dashboard/admin`,
          branchHeaders()
        );
        const data = res.data;
        console.log(data);

        setSummary({
          totalLearners: data.totalLearners,
          activeLearners: data.activeLearners,
          inactiveLearners: data.inactiveLearners,
          instructors: data.instructors,
          staff: data.staff,
          courses: data.courses,
        });

        setMonthlyData(
          (data.monthlyAdmissions || []).map((item) => ({
            month: item.month,
            learners: item.count,
          }))
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            setErrorMsg(
              error.response?.data?.message || error.response?.data?.error
            );
            return setTimeout(() => {
              clearAuthState();
              setErrorMsg("");
            }, 2000);
          }

          // ✅ Handle custom error messages
          const errorData = error?.response?.data;
          const errors =
            errorData?.errors || errorData?.message || "An error occurred";

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

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {errorMsg && <Toast message={errorMsg} />}

      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">
          Loading...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {summary.totalLearners}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Learners</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>
            {/* <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{summary.activeLearners}</p>
                <p className="mt-1 text-sm text-gray-600">Active Learners</p>
              </div>
              <FaUserCheck className="text-3xl text-blue-500" />
            </div> */}
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {summary.instructors}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Instructors</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {summary.staff}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Staff</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {summary.courses}
                </p>
                <p className="mt-1 text-sm text-gray-600">Courses</p>
              </div>
              <ImBooks className="text-3xl text-blue-500" />
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-4 bg-white border border-blue-300 rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-blue-600">
              {" "}
              Admissions
            </h3>
            <div className="w-full max-w-full mx-auto h-[360px] rounded-md border border-blue-200 ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="learners"
                    fill="#1c64f2"
                    name="No. of Admissions"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;
