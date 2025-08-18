import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { URL } from "../../../App";
import moment from "moment";
import Pagination from "../../../Components/Pagination";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext";

const StaffAttTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, clearAuthState } = useRole();

  const today = new Date().toISOString().split("T")[0];
  const itemsPerPage = 10;

  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const debounceTimer = useRef(null);
  const controllerRef = useRef(null);
  const isPasted = useRef(false);
  const lastPasted = useRef("");

  const updateURLParams = ({ search, status, fromdate, todate, page }) => {
    const params = new URLSearchParams(location.search);
    if (search !== undefined) search ? params.set("search", search) : params.delete("search");
    if (status !== undefined) status && status !== "All" ? params.set("status", status) : params.delete("status");
    if (fromdate !== undefined) fromdate ? params.set("fromdate", fromdate) : params.delete("fromdate");
    if (todate !== undefined) todate ? params.set("todate", todate) : params.delete("todate");
    if (page !== undefined) page && page > 1 ? params.set("page", page) : params.delete("page");
    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const status = params.get("status") || "";
    const from = params.get("fromdate") || today;
    const to = params.get("todate") || today;
    const page = parseInt(params.get("page")) || 1;

    setSearchQuery(search);
    setSelectedStatus(status);
    setFromDate(from);
    setToDate(to);
    setCurrentPage(page);

    if (!params.get("fromdate") || !params.get("todate")) {
      updateURLParams({ search, status, fromdate: from, todate: to, page });
    }
  }, [location.search]);

  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${URL}/api/admin/staff-attendance`, {
          params: {
            search: searchQuery,
            fromdate: moment(fromDate).format("YYYY-MM-DD"),
            todate: moment(toDate).format("YYYY-MM-DD"),
            status: selectedStatus,
            page: currentPage,
            limit: itemsPerPage,
          },
          withCredentials: true,
          signal: controller.signal,
        });

        setStaffList(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
        if (axios.isCancel(error)) return;
        if (
          error.response?.status === 401 ||
          error.response?.data?.message === "Credential Invalid or Expired Please Login Again"
        ) {
          setTimeout(() => clearAuthState(), 2000);
        } else {
          console.error(error);
          setErrorMessage("Failed to fetch staff attendance");
          clearTimeout(debounceTimer.current);
          errorTimeout();
        }
      } finally {
        setLoading(false);
      }
    };

    if (isPasted.current || searchQuery.trim() === "") {
      isPasted.current = false;
      fetchData();
    } else {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(fetchData, 1500);
    }

    return () => controller.abort();
  }, [searchQuery, fromDate, toDate, selectedStatus, currentPage]);

  const errorTimeout = () => {
    setTimeout(() => setErrorMessage(""), 4000);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    isPasted.current = false;
    setSearchQuery(val);
    updateURLParams({ search: val, status: selectedStatus, fromdate: fromDate, todate: toDate, page: 1 });
    setCurrentPage(1);
  };

  const handleSearchPaste = (e) => {
    const pasted = e.clipboardData.getData("text/plain");
    if (pasted === lastPasted.current) return;
    lastPasted.current = pasted;
    isPasted.current = true;
    setSearchQuery(pasted);
    updateURLParams({ search: pasted, status: selectedStatus, fromdate: fromDate, todate: toDate, page: 1 });
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    updateURLParams({ search: searchQuery, status: value, fromdate: fromDate, todate: toDate, page: 1 });
    setCurrentPage(1);
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value || today;
    setFromDate(value);
    updateURLParams({ search: searchQuery, status: selectedStatus, fromdate: value, todate: toDate, page: 1 });
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value || today;
    setToDate(value);
    updateURLParams({ search: searchQuery, status: selectedStatus, fromdate: fromDate, todate: value, page: 1 });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({ search: searchQuery, status: selectedStatus, fromdate: fromDate, todate: toDate, page });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">Staff Attendance Details</h3>
        <button
          onClick={() => navigate("/admin/attendance/staff/mark")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Mark
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-1/3">
          <svg
            className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            <circle cx="10" cy="10" r="7" />
          </svg>

          <input
            type="text"
            aria-label="Search staff attendance"
            className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            onPaste={handleSearchPaste}
          />
        </div>

        <div className="flex flex-col w-full gap-4 md:flex-row md:w-auto md:justify-end">
          <div className="relative w-full sm:w-36">
            <select
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="">All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 font-semibold text-center text-red-600">{errorMessage}</div>
      )}

      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-sm text-left text-gray-700 bg-gray-50">
              <tr>
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
              {staffList.length > 0 ? (
                staffList.map((staff, index) => (
                  <tr key={staff._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(staff.staff.photo)}`}
                        alt={staff.staff.fullName}
                        className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">{staff.staff.fullName}</td>
                    <td className="px-6 py-4">
                      {moment(staff.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">{moment(staff.checkIn).format("hh:mm A")}</td>
                    <td className="px-6 py-4">{moment(staff.checkOut).format("hh:mm A")}</td>
                    <td className="px-6 py-4">
                      {moment.duration(moment(staff.checkOut).diff(moment(staff.checkIn))).hours()}h{" "}
                      {moment.duration(moment(staff.checkOut).diff(moment(staff.checkIn))).minutes()}m
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
              ) : (
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
        <Pagination CurrentPage={currentPage} TotalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default StaffAttTable;
