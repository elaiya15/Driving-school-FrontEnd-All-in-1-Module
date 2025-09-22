import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../../App";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../../../Components/Pagination";
import moment from "moment";
import { FaSyncAlt } from "react-icons/fa";
import { useRole } from "../../../Components/AuthContext/AuthContext"; // adjust path as needed
import branchHeaders from "../../../Components/utils/headers";

const SingleStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user, setUser, setRole, clearAuthState } = useRole();

  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "";
  };

  useEffect(() => {
    const controller = new AbortController();
    const debounceTimer = setTimeout(() => {
      const fetchStaff = async () => {
        setLoading(true);
        try {
          if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            console.error(
              "Invalid date range. 'From Date' cannot be greater than 'To Date'."
            );
            return;
          }

          const queryParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage,
            status,
            search: searchTerm,
            fromdate: formatDate(fromDate),
            todate: formatDate(toDate),
          });

          const response = await axios.get(
            `${URL}/api/v2/staff-attendance/${id}?${queryParams.toString()}`,
            {
              ...branchHeaders(),

              signal: controller.signal,
            }
          );

          setAttendance(response.data.records || []);
          setTotalPages(response.data.totalPages || 1);
        } catch (error) {
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data?.message ===
                "Credential Invalid or Expired Please Login Again")
          ) {
            setTimeout(() => {
              clearAuthState();
              // navigate("/");
            }, 2000);
          }
        } finally {
          setLoading(false);
        }
      };

      if (id) {
        fetchStaff();
      }
    }, 2000);

    return () => {
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, status, fromDate, toDate, currentPage, id]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setStatus("");
    setFromDate("");
    setToDate("");
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

      <div className="flex flex-col justify-between mb-4 space-y-2 md:flex-row md:items-center md:space-y-0">
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
                className="w-4 h-4"
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

        <div className="flex flex-col items-center w-full md:flex-row md:space-x-4 md:w-auto">
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
          </div>
        </div>
      </div>
      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">
          Loading...
        </div>
      ) : attendance.length > 0 ? (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="bg-gray-100">
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Working hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => {
                const checkIn = record.checkIn ? moment(record.checkIn) : null;
                const checkOut = record.checkOut
                  ? moment(record.checkOut)
                  : null;
                const duration =
                  checkIn && checkOut
                    ? moment.duration(checkOut.diff(checkIn))
                    : null;

                return (
                  <tr key={record._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      {moment(record.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      {checkIn ? checkIn.format("hh:mm A") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {checkOut ? checkOut.format("hh:mm A") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {duration
                        ? `${duration.hours()}h ${duration.minutes()}m`
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          record.status === "Present"
                            ? "text-green-600"
                            : record.status === "Absent"
                            ? "text-red-600"
                            : "text-blue-600"
                        }
                      >
                        {record.status || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-4 text-center text-red-500">Attendance not found</p>
      )}
      {attendance.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SingleStaff;
