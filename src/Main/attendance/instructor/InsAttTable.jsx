import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { URL } from "../../../App";
import moment from "moment";
import Pagination from "../../../Components/Pagination";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext";
import branchHeaders from "../../../Components/utils/headers.jsx";

const InsAttTable = () => {
  const navigate = useNavigate();
  const { role, user, setUser, setRole, clearAuthState } = useRole();
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];

  const [attendances, setAttendances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromdate, setFromdate] = useState(today);
  const [todate, setTodate] = useState(today);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const controllerRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const lastPastedValue = useRef("");
  const itemsPerPage = 10;

  const updateURLParams = ({ search, status, fromdate, todate, page }) => {
    const params = new URLSearchParams(location.search);
    if (search !== undefined) search ? params.set("search", search) : params.delete("search");
    if (status !== undefined) status && status !== "All" ? params.set("status", status) : params.delete("status");
    if (fromdate !== undefined) fromdate ? params.set("fromdate", fromdate) : params.delete("fromdate");
    if (todate !== undefined) todate ? params.set("todate", todate) : params.delete("todate");
    if (page !== undefined) page > 1 ? params.set("page", page) : params.delete("page");

    navigate({ pathname: location.pathname, search: params.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const statusFromURL = params.get("status") || "";
    const fromDateFromURL = params.get("fromdate");
    const toDateFromURL = params.get("todate");
    const pageFromURL = parseInt(params.get("page")) || 1;

    if (!fromDateFromURL || !toDateFromURL) {
      const updatedParams = new URLSearchParams(location.search);
      if (!fromDateFromURL) updatedParams.set("fromdate", today);
      if (!toDateFromURL) updatedParams.set("todate", today);
      navigate({ pathname: location.pathname, search: updatedParams.toString() }, { replace: true });
      return;
    }

    setSearchQuery(searchFromURL);
    setSelectedStatus(statusFromURL);
    setFromdate(fromDateFromURL);
    setTodate(toDateFromURL);
    setCurrentPage(pageFromURL);
  }, [location.search]);

  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    let debounceTimer;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${URL}/api/v2/instructor-attendance`, {
            ...branchHeaders(),
          params: {
            fromdate: moment(fromdate).format("YYYY-MM-DD"),
            todate: moment(todate).format("YYYY-MM-DD"),
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            status: selectedStatus,
          },
        
          signal: controllerRef.current.signal,
        });

        setAttendances(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setError("");
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Failed to fetch data.");
          // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
          setError(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            setError("");
          }, 2000);
        }
      } finally {
        setLoading(false);
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => setError(""), 4000);
      }
    };

    if (searchQuery.trim()) {
      debounceTimer = setTimeout(fetchData, 1500);
    } else {
      fetchData();
    }

    return () => {
      clearTimeout(debounceTimer);
      controllerRef.current?.abort();
    };
  }, [searchQuery, selectedStatus, currentPage, fromdate, todate]);

  useEffect(() => () => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
  }, []);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateURLParams({ search: value, status: selectedStatus, fromdate, todate, page: 1 });
    setCurrentPage(1);
  };

  const handleSearchPaste = (e) => {
    const pastedText = e.clipboardData.getData("Text");
    if (pastedText === lastPastedValue.current) return;
    lastPastedValue.current = pastedText;
    setSearchQuery(pastedText);
    updateURLParams({ search: pastedText, status: selectedStatus, fromdate, todate, page: 1 });
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    updateURLParams({ search: searchQuery, status: value, fromdate, todate, page: 1 });
    setCurrentPage(1);
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromdate(value);
    updateURLParams({ search: searchQuery, status: selectedStatus, fromdate: value, todate, page: 1 });
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setTodate(value);
    updateURLParams({ search: searchQuery, status: selectedStatus, fromdate, todate: value, page: 1 });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({ search: searchQuery, status: selectedStatus, fromdate, todate, page });
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-xl font-bold text-center md:text-left">
            Instructor Attendance Details
          </h3>
          <button
            onClick={() => navigate("/admin/attendance/instructor/mark")}
            className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
          >
            Mark
          </button>
        </div>

     <div className="relative flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        
           <div className="flex w-full lg:w-1/3">
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
              className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
           value={searchQuery}
              onChange={handleSearchInput}
              onPaste={handleSearchPaste}
            />
{/* 
            {searchQuery && (
              <div
                onClick={() => {
                  setSearchQuery("");
                  updateURLParams({
                    search: "",
                    status: selectedStatus,
                    fromdate,
                    todate,
                    page: 1,
                  });
                  setCurrentPage(1);
                }}
                className=" absolute right-3 top-2.5">
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
              </div>
            )} */}
        </div>

          <div className="flex flex-col w-full gap-4 md:flex-row md:items-center md:w-auto md:justify-end">
            <div className="relative w-full sm:w-36">
              <select
                id="status"
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg peer focus:outline-none focus:ring-0 focus:border-blue-600"
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                <option value="All">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              <label
                htmlFor="status"
                className={`absolute left-3 -top-2 text-xs bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                  selectedStatus ? "text-blue-600" : ""
                }`}
              >
                Status
              </label>
            </div>

            <div className="relative w-full md:w-40">
              <input
                type="date"
                value={fromdate}
                onChange={handleFromDateChange}
                onFocus={(e) => (e.nativeEvent.target.defaultValue = "")}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
              />
              <label className="absolute px-1 text-xs text-gray-500 bg-white left-3 -top-2">
                From
              </label>
            </div>

            <div className="relative w-full md:w-40">
              <input
                type="date"
                value={todate}
                onChange={handleToDateChange}
                onFocus={(e) => (e.nativeEvent.target.defaultValue = "")}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
              />
              <label className="absolute px-1 text-xs text-gray-500 bg-white left-3 -top-2">
                To
              </label>
            </div>
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
              <tr className="">
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
                <th className="px-6 py-4">Working hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances?.length > 0 ? (
                attendances.map((attendance, index) => (
                  <tr key={attendance._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(
                          attendance.instructor.photo
                        )}`}
                        alt={attendance.instructor.photo.fullName}
                        className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {attendance.instructor.fullName}
                    </td>
                    <td className="px-6 py-4">
                      {moment(attendance.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      {moment(attendance.checkIn).format("hh:mm A")}
                    </td>
                    <td className="px-6 py-4">
                      {moment(attendance.checkOut).format("hh:mm A")}
                    </td>
                    <td className="px-6 py-4">
                      {moment
                        .duration(
                          moment(attendance.checkOut).diff(
                            moment(attendance.checkIn)
                          )
                        )
                        .hours()}{" "}
                      h{" "}
                      {moment
                        .duration(
                          moment(attendance.checkOut).diff(
                            moment(attendance.checkIn)
                          )
                        )
                        .minutes()}{" "}
                      m
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          attendance.status === "Present"
                            ? "text-green-600"
                            : attendance.status === "Absent"
                            ? "text-red-600"
                            : "text-blue-600"
                        }
                      >
                        {attendance.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-4 text-center text-red-500 bg-white border-b"
                  >
                    Attendance not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {attendances?.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default InsAttTable;
