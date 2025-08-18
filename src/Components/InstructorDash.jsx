import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaUsers, FaCalendarCheck, FaClipboardList,
} from 'react-icons/fa';

const InstructorDashboard = ({ instructorId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchDashboard = async () => {
  //     try {
  //       const res = await axios.get(`/api/dashboard/instructor/${instructorId}`);
  //       setData(res.data);
  //     } catch (err) {
  //       console.error('Error loading instructor dashboard:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (instructorId) fetchDashboard();
  // }, [instructorId]);

  const cardClass =
    "flex items-center justify-between p-4 border-2 border-indigo-400 rounded-xl bg-white shadow-sm w-full";

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">Instructor Dashboard</h2> */}

      {loading ? (
                 <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>

      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
          <div className={cardClass}>
            <div>
              <p className="text-3xl font-bold text-indigo-600">{data?.assignedLearners ?? '--'}</p>
              <p className="text-gray-600 text-sm mt-1">Assigned Learners</p>
            </div>
            <FaUsers className="text-indigo-500 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className="text-3xl font-bold text-indigo-600">{data?.upcomingClasses ?? '--'}</p>
              <p className="text-gray-600 text-sm mt-1">Upcoming Classes</p>
            </div>
            <FaClipboardList className="text-indigo-500 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className="text-3xl font-bold text-indigo-600">{data?.attendanceMarked ?? '--'}</p>
              <p className="text-gray-600 text-sm mt-1">Attendance Marked</p>
            </div>
            <FaCalendarCheck className="text-indigo-500 text-3xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
