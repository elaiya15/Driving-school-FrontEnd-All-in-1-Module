import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaUsers } from "react-icons/fa";
import { ImBooks } from "react-icons/im";

// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
    {message}
  </div>
);

export default function OwnerDashboard() {
  const { role, clearAuthState } = useRole();
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role !== "owner") {
          throw new Error("Unauthorized: Only owner can access this dashboard.");
        }

        const res = await axios.get(`${URL}/api/v1/dashboard/organization`, {
          withCredentials: true,
        });
        

        setStats(res.data.stats);

        const data = res.data.revenueData || [];
        const branchNames = [...new Set(data.map((d) => d.branch || "Unknown"))];
        setBranches(branchNames);

        const grouped = {};
        data.forEach((item) => {
          const key = `${item.year}-${item.month}`;
          if (!grouped[key]) grouped[key] = { month: `${item.month}/${item.year}` };
          grouped[key][item.branch || "Unknown"] = item.total;
        });
        setRevenueData(Object.values(grouped));
      } catch (error) {
        console.error("Error loading dashboard:", error);

        if (error.response?.status === 401) {
          setErrorMsg("Credential Invalid or Expired. Please login again.");
          return setTimeout(() => {
            clearAuthState();
            setErrorMsg("");
          }, 2000);
        }

        setErrorMsg(error.message || "An error occurred");
        setTimeout(() => setErrorMsg(""), 4000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardClass =
    "flex items-center justify-between p-4 border-2 border-blue-400 rounded-xl bg-white shadow-sm w-full";

  const lineColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {errorMsg && <Toast message={errorMsg} />}

      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.totalBranches || 0}</p>
                <p className="mt-1 text-sm text-gray-600">Total Branches</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>

            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.totalLearners || 0}</p>
                <p className="mt-1 text-sm text-gray-600">Total Learners</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>

            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.totalInstructors || 0}</p>
                <p className="mt-1 text-sm text-gray-600">Total Instructors</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="p-4 bg-white border border-blue-300 rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-blue-600">Revenue Trends (Branch-wise)</h3>
            {revenueData.length === 0 ? (
              <div className="py-20 text-center text-gray-400">No revenue data available.</div>
            ) : (
              <div className="w-full h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {branches.map((branch, index) => (
                      <Line
                        key={branch}
                        type="monotone"
                        dataKey={branch}
                        stroke={lineColors[index % 4]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
