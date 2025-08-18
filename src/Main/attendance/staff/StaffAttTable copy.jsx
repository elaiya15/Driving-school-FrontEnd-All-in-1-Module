import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { URL } from "../../../App";
import moment from "moment";
import Pagination from "../../../Components/Pagination";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext"; // adjust path as needed

const StaffAttTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
    const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const today = new Date().toISOString().split("T")[0];

  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  const updateURLParams = ({ search, status, fromdate, todate, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
    }

    if (status !== undefined) {
      if (status && status !== "All") {
        params.set("status", status);
      } else {
        params.delete("status");
      }
    }

    if (fromdate !== undefined) {
      if (fromdate) {
        params.set("fromdate", fromdate);
      } else {
        params.delete("fromdate");
      }
    }

    if (todate !== undefined) {
      if (todate) {
        params.set("todate", todate);
      } else {
        params.delete("todate");
      }
    }

    if (page !== undefined) {
      if (page && page > 1) {
        params.set("page", page);
      } else {
        params.delete("page");
      }
    }

    navigate({ search: params.toString() });
  };

  useEffect(() => {
  const params = new URLSearchParams(location.search);

  const searchFromURL = params.get("search") || "";
  const statusFromURL = params.get("status") || "";
  const fromDateFromURL = params.get("fromdate");
  const toDateFromURL = params.get("todate");
  const pageFromURL = parseInt(params.get("page")) || 1;

  const hasFromDate = !!fromDateFromURL;
  const hasToDate = !!toDateFromURL;

  const defaultFrom = today;
  const defaultTo = today;

  // Update URL if fromdate or todate is missing
  if (!hasFromDate || !hasToDate) {
    updateURLParams({
      search: searchFromURL,
      status: statusFromURL,
      fromdate: fromDateFromURL || defaultFrom,
      todate: toDateFromURL || defaultTo,
      page: pageFromURL,
    });
  }

  setSearchQuery(searchFromURL);
  setSelectedStatus(statusFromURL);
  setFromDate(fromDateFromURL || defaultFrom);
  setToDate(toDateFromURL || defaultTo);
  setCurrentPage(pageFromURL);
}, [location.search]);

  useEffect(() => {
    const controller = new AbortController();
    let debounceTimer;

    const fetchStaffAttendance = async () => {
      setLoading(true);

      try {

        const formattedFromDate = fromDate
          ? moment(fromDate).format("YYYY-MM-DD")
          : "";
        const formattedToDate = toDate
          ? moment(toDate).format("YYYY-MM-DD")
          : "";

        const response = await axios.get(`${URL}/api/admin/staff-attendance`, {
          params: {
            fromdate: formattedFromDate,
            todate: formattedToDate,
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            status: selectedStatus,
          },
                   withCredentials: true,

          signal: searchQuery.trim() ? controller.signal : undefined,
        });

        setStaffList(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (axios.isCancel(error) || error.name === "CanceledError") {
          // Request was canceled
        } else {
          console.error("Error fetching staff attendance:", error);
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Credential Invalid or Expired Please Login Again")
          ) {
            setTimeout(() => {
              clearAuthState();
              // navigate("/");
            }, 2000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery.trim()) {
      debounceTimer = setTimeout(fetchStaffAttendance, 2000);
    } else {
      fetchStaffAttendance();
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (searchQuery.trim()) controller.abort();
    };
  }, [searchQuery, selectedStatus, currentPage, fromDate, toDate]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateURLParams({
      search: value,
      status: selectedStatus,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    updateURLParams({
      search: searchQuery,
      status: value,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

const handleFromDateChange = (e) => {
  const value = e.target.value || today;
  setFromDate(value);

  updateURLParams({
    search: searchQuery,
    status: selectedStatus,
    fromdate: value,
    todate: toDate,
    page: 1,
  });
  setCurrentPage(1);
};

 const handleToDateChange = (e) => {
  const value = e.target.value || today;
  setToDate(value);

  updateURLParams({
    search: searchQuery,
    status: selectedStatus,
    fromdate: fromDate,
    todate: value,
    page: 1,
  });
  setCurrentPage(1);
};


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({
        search: searchQuery,
        status: selectedStatus,
        fromdate: fromDate,
        todate: toDate,
        page,
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">
          Staff Attendance Details
        </h3>
        <button
          onClick={() => navigate("/admin/attendance/staff/mark")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Mark
        </button>
      </div>

             <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">

                   <div className="w-full lg:w-1/3">
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
            <circle cx="10" cy="10" r="7" />
          </svg>

          <input
            type="text"
            aria-label="Search instructor attendance"
            className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {searchQuery && (
            <button
              aria-label="Clear search"
              className="absolute p-1 text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-blue-500"
              onClick={() => {
                setSearchQuery("");
                updateURLParams({
                  search: "",
                  status: selectedStatus,
                  fromdate: fromDate,
                  todate: toDate,
                  page: 1,
                });
                setCurrentPage(1);
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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

        <div className="flex flex-col w-full gap-4 md:flex-row md:items-center md:w-auto md:justify-end">
          <div className="relative w-full sm:w-36">
            <select
              id="floating_status"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="">All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
            <label
              htmlFor="floating_status"
              className={`absolute text-xs left-3 top-[-8px] bg-white dark:bg-gray-900 px-1 text-gray-500 peer-focus:text-blue-600 ${
                selectedStatus ? "text-blue-600" : ""
              }`}
            >
              Status
            </label>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              onFocus={(e) => (e.nativeEvent.target.defaultValue = "")}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white dark:bg-gray-900 px-1 text-gray-500">
              From
            </label>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              onFocus={(e) => (e.nativeEvent.target.defaultValue = "")}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white dark:bg-gray-900 px-1 text-gray-500">
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
              <tr className="">
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Working hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length > 0
                ? staffList.map((staff, index) => (
                    <tr key={staff._id} className="bg-white border-b">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">
                        <img
                          src={`${URL}/api/image-proxy/${extractDriveFileId(
                            staff.staff.photo
                          )}`}
                          alt={staff.staff.fullName}
                          className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"
                        />
                      </td>
                      <td className="px-6 py-4">{staff.staff.fullName}</td>
                      <td className="px-6 py-4">
                        {moment(staff.date).format("DD-MM-YYYY")}
                      </td>
                      <td className="px-6 py-4">
                        {moment(staff.checkIn).format("hh:mm A")}
                      </td>
                      <td className="px-6 py-4">
                        {moment(staff.checkOut).format("hh:mm A")}
                      </td>
                      <td className="px-6 py-4">
                        {moment
                          .duration(
                            moment(staff.checkOut).diff(moment(staff.checkIn))
                          )
                          .hours()}
                        h{" "}
                        {moment
                          .duration(
                            moment(staff.checkOut).diff(moment(staff.checkIn))
                          )
                          .minutes()}
                        m
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            staff.status === "Present"
                              ? "text-green-600"
                              : staff.status === "Absent"
                              ? "text-red-600"
                              : "text-blue-600"
                          }
                        >
                          {staff.status || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan="8" className="py-4 text-center text-red-500">
                        Attendance not found
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      )}
      {!loading && staffList.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default StaffAttTable;
