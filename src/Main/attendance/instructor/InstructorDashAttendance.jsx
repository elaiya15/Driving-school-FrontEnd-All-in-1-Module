import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../../App";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../Components/Pagination";
import moment from "moment";
import { FaSyncAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useRole } from "../../../Components/AuthContext/AuthContext"; // adjust path as needed

const InstructorDashAttendance = () => {
  const navigate = useNavigate();
    const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [attendance, setAttendance] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const InstructorId = decoded?.user_id;

  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "";
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
          console.error(
            "Invalid date range. 'From Date' cannot be greater than 'To Date'."
          );
          return;
        }

        const response = await axios.get(
          `${URL}/api/instructor-attendance/${InstructorId}`,
          {
            params: {
              page: currentPage,
              limit: itemsPerPage,
              status,
              search: searchTerm,
              fromdate: formatDate(fromDate),
              todate: formatDate(toDate),
            },
                   withCredentials: true,

          }
        );

        setAttendance(response.data.instructors);
        setRecords(response.data.records);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching instructor attendance:", error);
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Credential Invalid or Expired Please Login Again")
          ) {
            return setTimeout(() => {
              // clearAuthState();
              navigate("/");
            }, 2000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [searchTerm, status, fromDate, toDate, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setStatus("");
    setFromDate("");
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <h3 className="text-base font-semibold">Attendance History</h3>
        <FaSyncAlt
          className="text-blue-500 cursor-pointer hover:text-blue-600"
          onClick={handleRefresh}
          size={20}
          aria-label="Refresh Tests"
        />
      </div>

      <div className="flex flex-col justify-between w-full gap-4 mb-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-1/3">
          <svg
            className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35"
            />
            <circle cx="10" cy="10" r="7" />
          </svg>
          <input
            type="text"
            className="w-full py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-blue-500"
              onClick={() => setSearchTerm("")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col flex-wrap justify-end w-full gap-4 sm:flex-row md:w-auto">
          <div className="relative w-full sm:w-36">
            <select
              id="floating_status"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
            <label
              htmlFor="floating_payment"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${status ? "text-blue-600" : ""}`}
            >
              Status
            </label>{" "}
          </div>
          <div className="relative w-full sm:w-40">
            <input
              type="date"
              id="floating_from_date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
              placeholder=" "
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              From Date
            </label>
          </div>
          <div className="relative w-full sm:w-40">
            <input
              type="date"
              id="floating_to_date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
              placeholder=" "
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              To Date
            </label>
          </div>{" "}
        </div>
      </div>
      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">
          Loading...
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          {records.length > 0 ? (
            <table className="w-full text-sm text-gray-500">
              <thead className="text-sm text-left text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check-in</th>
                  <th className="px-6 py-4">Check-out</th>
                  <th className="px-6 py-4">Working hours</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={record._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
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
                    <td className="px-6 py-4">
                      {moment
                        .duration(
                          moment(record.checkOut).diff(moment(record.checkIn))
                        )
                        .hours()}{" "}
                      h{" "}
                      {moment
                        .duration(
                          moment(record.checkOut).diff(moment(record.checkIn))
                        )
                        .minutes()}{" "}
                      m
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          record.status === "Present"
                            ? "text-green-600"
                            : record.status === "Leave"
                            ? "text-blue-600"
                            : "text-red-600"
                        }
                      >
                        {record.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-6 text-center text-red-600">
              No attendance records found
            </div>
          )}
        </div>
      )}
      {records.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default InstructorDashAttendance;
