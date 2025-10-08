import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import { FaUsers } from "react-icons/fa";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
    {message}
  </div>
);

export default function OwnerDashboard() {
  const { role, clearAuthState } = useRole();
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
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
        setRevenueData(res.data.revenueData || []);
        setYearlyRevenue(res.data.yearlyRevenue || []);
      } catch (error) {
        console.error("Error loading dashboard:", error);

                // ✅ 401 handling

            if (error.response?.status === 401|| error.response?.status === 403) {
          setErrorMsg(error.response?.data?.message||error.response?.data?.error );
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
                  {stats.totalBranches || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Branches</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>

            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalLearners || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Learners</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>

            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalInstructors || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Instructors</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>
          </div>
                 {/* Yearly Revenue Chart */}
<div className="p-4 bg-white border border-blue-300 rounded-xl">
  <h3 className="mb-4 text-lg font-bold text-blue-600">Yearly Revenue Trend</h3>
  {yearlyRevenue.length === 0 ? (
    <div className="py-20 text-center text-gray-400">
      No yearly revenue data available.
    </div>
  ) : (
    <div className="w-full max-w-full mx-auto h-[360px] rounded-md border border-blue-200">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yearlyRevenue} barSize={50}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar
            dataKey="total"
            fill="#1c64f2"
            name="Total Revenue"
            // radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}
</div>

          {/* Revenue Table */}
          <div className="p-4 mb-6 bg-white border border-blue-300 rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-blue-600">
              Revenue Report (Branch-wise Monthly)
            </h3>
            {revenueData.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                No revenue data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-blue-700 bg-blue-100">
                      <th className="p-2 text-left border">Branch</th>
                      <th className="p-2 text-left border">Month</th>
                      <th className="p-2 text-left border">Year</th>
                      <th className="p-2 text-left border">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="text-sm border-b hover:bg-gray-50"
                      >
                        <td className="p-2 border">
                          {row.branchName || "Unknown"}
                        </td>
                        <td className="p-2 border">{row.month}</td>
                        <td className="p-2 border">{row.year}</td>
                        <td className="p-2 font-semibold text-green-600 border">
                          ₹{row.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Yearly Revenue Chart
          <div className="p-4 bg-white border border-blue-300 rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-blue-600">
              Yearly Revenue Trend
            </h3>
            {yearlyRevenue.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                No yearly revenue data available.
              </div>
            ) : (
              <div className="w-full h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyRevenue}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div> */}

   

        </>
      )}
    </div>
  );
}
