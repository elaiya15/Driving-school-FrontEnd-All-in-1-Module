
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import {
  FaUsers, FaUserCheck, FaUserTimes,
  FaCalendarAlt, FaRupeeSign, FaChartLine
} from 'react-icons/fa';
import { ImBooks } from "react-icons/im";
const DashboardAdmin = () => {
  const [summary, setSummary] = useState({
    totalLearners: 120,
    activeLearners: 100,
    inactiveLearners: 20,
    instructors: 10,
    staff: 5,
    courses: 6,
  });

  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    setMonthlyData([
      { month: 'Jan', learners: 45 },
      { month: 'Feb', learners: 23 },
      { month: 'Mar', learners: 42 },
      { month: 'Apr', learners: 80 },
      { month: 'May', learners: 50 },
      { month: 'Jun', learners: 44 },
      { month: 'Jul', learners: 20 },
    ]);
  }, []);

  const cardClass = "flex items-center justify-between p-4 border-2 border-blue-400 rounded-xl bg-white shadow-sm w-full";

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Driving School Admin Dashboard</h2> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
        <div className={cardClass}>
          <div>
            <p className="text-3xl font-bold text-blue-600">{summary.totalLearners}</p>
            <p className="text-gray-600 text-sm mt-1">Total Learners</p>
          </div>
          <FaUsers className="text-blue-500 text-3xl" />
        </div>
        <div className={cardClass}>
          <div>
            <p className="text-3xl font-bold text-blue-600">{summary.activeLearners}</p>
            <p className="text-gray-600 text-sm mt-1">Active Learners</p>
          </div>
          <FaUserCheck className="text-blue-500 text-3xl" />
        </div>
        <div className={cardClass}>
          <div>
            <p className="text-3xl font-bold text-blue-600">{summary.inactiveLearners}</p>
            <p className="text-gray-600 text-sm mt-1"> Total Instructor</p>
          </div>
          <FaUsers className="text-blue-500 text-3xl" />

          {/* <FaUserTimes className="text-blue-500 text-3xl" /> */}
        </div>
        <div className={cardClass}>
          <div>
            <p className="text-3xl font-bold text-blue-600">10</p>
            <p className="text-gray-600 text-sm mt-1">Total staff</p>
          </div>
                    <FaUsers className="text-blue-500 text-3xl" />

          {/* <FaCalendarAlt className="text-blue-500 text-3xl" /> */}
        </div>
        <div className={cardClass}>
          <div>
            <p className="text-3xl font-bold text-blue-600">8</p>
            <p className="text-gray-600 text-sm mt-1">Course</p>
          </div>
           <ImBooks className="text-blue-500 text-3xl" />
          {/* <FaRupeeSign className="text-blue-500 text-3xl" /> */}
        </div>
        {/* <div className={cardClass}>
          <div>
            <p className="text-3xl font-bold text-blue-600">₹ 0.00</p>
            <p className="text-gray-600 text-sm mt-1">Total Expenses</p>
          </div>
          <FaChartLine className="text-blue-500 text-3xl" />
        </div> */}
      </div>
 {/* Chart Section */}
<div className="bg-white border border-blue-300 rounded-xl p-4">
  <h3 className="text-lg font-bold text-blue-600 mb-4">Monthly Admissions</h3>
  <div className="w-full max-w-full mx-auto h-[360px] rounded-md border border-blue-200 p-2">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyData} barSize={50}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="learners" fill="#4F46E5" name="no.of admission" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>


    </div>
  );
};

export default DashboardAdmin;
