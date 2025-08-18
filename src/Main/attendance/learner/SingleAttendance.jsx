import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../../../App";
import Pagination from "../../../Components/Pagination";
import { FaSyncAlt } from "react-icons/fa";
import { useRole } from "../../../Components/AuthContext/AuthContext";
const SingleAttendance = () => {
   const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const { id } = useParams();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [search, setSearch] = useState("");
  const [classType, setClassType] = useState("");

  const limit = 5;

  useEffect(() => {
    const controller = new AbortController();

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {

        const formatDate = (date) =>
          date ? new Date(date).toISOString().split("T")[0] : "";

        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
          console.error(
            "Invalid date range. 'From Date' cannot be greater than 'To Date'."
          );
          return;
        }

        const queryParams = new URLSearchParams({
          page: currentPage,
          fromdate: formatDate(fromDate),
          todate: formatDate(toDate),
          search: search,
          classType,
          limit,
        });

        const response = await axios.get(
          `${URL}/api/learner-attendance/${id}?${queryParams}`,
          {
                       withCredentials: true,

            signal: controller.signal,
          }
        );

        setAttendanceData(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching data:", error);

        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          return setTimeout(() => {
           clearAuthState();
            // navigate("/");
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (search.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchAttendanceData();
      }, 2000);

      return () => {
        clearTimeout(debounceTimer);
        controller.abort();
      };
    } else {
      fetchAttendanceData();
      return () => controller.abort();
    }
  }, [currentPage, toDate, fromDate, classType, search, id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleRefresh = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <h3 className="text-base font-semibold">Attendance  History</h3>
        <FaSyncAlt
          className="text-blue-500 cursor-pointer hover:text-blue-600"
          onClick={handleRefresh}
          size={20}
          aria-label="Refresh Tests"
        />
      </div>

      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-1/3">
          <svg
            className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35"
            />
            <circle cx="10" cy="10" r="7"></circle>
          </svg>
          <input
            type="search"
            className="w-full py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col w-full gap-4 md:flex-row md:w-auto md:items-center md:space-x-4">
          <div className="relative w-full sm:w-36">
            <select
              id="floating_class"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
            >
              <option value="">All</option>
              <option value="Practical">Practical</option>
              <option value="Theory">Theory</option>
            </select>
            <label
              htmlFor="floating_class"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${classType ? "text-blue-600" : ""}`}
            >
              Class Type
            </label>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              From
            </label>
          </div>
          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              To
            </label>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">
          Loading...
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-sm text-left text-gray-700 bg-gray-50">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Course Type</th>
                <th className="px-6 py-4">Class Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
              </tr>
            </thead>
            <tbody>
              {!attendanceData || attendanceData.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-6 text-center text-red-600 bg-white"
                  >
                    Attendance not found
                  </td>
                </tr>
              ) : (
                attendanceData.map((record, index) => (
                  <tr key={record._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      {record.course?.courseName || "-"}
                    </td>
                    <td className="px-6 py-4">{record.classType || "-"}</td>
                    <td className="px-6 py-4">
                      {moment(record.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkIn
                        ? moment(record.checkIn).format("hh:mm A")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkOut
                        ? moment(record.checkOut).format("hh:mm A")
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && attendanceData.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SingleAttendance;
