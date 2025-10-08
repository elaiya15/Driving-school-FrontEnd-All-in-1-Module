import { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { URL } from "../../../App";
import Pagination from "../../../Components/Pagination";
import { useRole } from "../../../Components/AuthContext/AuthContext";

const LearnerSingleAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, clearAuthState } = useRole();

  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [search, setSearch] = useState("");
  const [classType, setClassType] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [date, setDate] = useState("");

  const debounceTimeout = useRef(null);
  const limit = 5;

  const updateURLParams = ({
    search,
    fromdate,
    todate,
    date,
    page,
    classType,
  }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      search.trim().length >= 3
        ? params.set("search", search)
        : params.delete("search");
    }
    fromdate !== undefined &&
      (fromdate ? params.set("fromdate", fromdate) : params.delete("fromdate"));
    todate !== undefined &&
      (todate ? params.set("todate", todate) : params.delete("todate"));
    date !== undefined &&
      (date ? params.set("date", date) : params.delete("date"));
    classType !== undefined &&
      (classType ? params.set("classType", classType) : params.delete("classType"));
    page !== undefined &&
      (page > 1 ? params.set("page", page) : params.delete("page"));

    navigate({ search: params.toString() });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user?.user_id) return;

    const controller = new AbortController();

    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);

      if ((fromDate && !toDate) || (!fromDate && toDate)) {
        setLoading(false);
        return;
      }

      try {
        const formattedFromDate = fromDate
          ? moment(fromDate).format("YYYY-MM-DD")
          : "";
        const formattedToDate = toDate
          ? moment(toDate).format("YYYY-MM-DD")
          : "";
        const formattedDate = date ? moment(date).format("YYYY-MM-DD") : "";

        const params = {
          page: currentPage,
          limit,
          classType,
          fromdate: formattedFromDate,
          todate: formattedToDate,
          date: formattedDate,
        };

        if (debouncedSearch.trim().length >= 3) {
          params.search = debouncedSearch.trim();
        }

        const response = await axios.get(
          `${URL}/api/learner-attendance/${user.user_id}`,
          {
            params,
            withCredentials: true,
            signal: controller.signal,
          }
        );

        setAttendanceData(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error(error);

           // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
          setError(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            setError("");
          }, 2000);
        }
        setError("Failed to fetch data");

        // if (
        //   error.response &&
        //   (error.response.status === 401 ||
        //     error.response.data.message === "Credential Invalid or Expired Please Login Again")
        // ) {
        //   clearAuthState();
        // }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
    return () => controller.abort();
  }, [
    user,
    authLoading,
    fromDate,
    toDate,
    currentPage,
    classType,
    date,
    debouncedSearch,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setFromDate(params.get("fromdate") || "");
    setToDate(params.get("todate") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);
    setClassType(params.get("classType") || "");
    setDate(params.get("date") || "");
  }, [location.search]);

  useEffect(() => {
  const params = new URLSearchParams(location.search);

  const urlSearch = params.get("search") || "";
  const urlFromDate = params.get("fromdate") || "";
  const urlToDate = params.get("todate") || "";
  const urlClassType = params.get("classType") || "";
  const urlDate = params.get("date") || "";
  const urlPage = parseInt(params.get("page")) || 1;

  setSearch(urlSearch);
  setFromDate(urlFromDate);
  setToDate(urlToDate);
  setClassType(urlClassType);
  setDate(urlDate);
  setCurrentPage(urlPage);

  // Initial URL normalization — add default query params if missing
  const shouldUpdate =
    !params.has("page") ||
    !params.has("limit") ||
    params.get("limit") !== "5";

  if (shouldUpdate) {
    params.set("page", urlPage.toString());
    params.set("limit", "5");

    if (urlSearch.trim().length < 3) params.delete("search");
    if (!urlFromDate) params.delete("fromdate");
    if (!urlToDate) params.delete("todate");
    if (!urlClassType) params.delete("classType");
    if (!urlDate) params.delete("date");

    navigate({ search: params.toString() }, { replace: true });
  }
}, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
      updateURLParams({
        search: value,
        fromdate: fromDate,
        todate: toDate,
        date,
        classType,
        page: 1,
      });
    }, 2000);
  };

  const handleClassTypeChange = (e) => {
    const value = e.target.value;
    setClassType(value);
    updateURLParams({
      search,
      fromdate: fromDate,
      todate: toDate,
      classType: value,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);
    if (!value) {
      setToDate("");
      updateURLParams({
        fromdate: "",
        todate: "",
        search,
        page: 1,
      });
    } else {
      updateURLParams({
        fromdate: value,
        todate: toDate,
        search,
        page: 1,
      });
    }
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value);
    updateURLParams({
      fromdate: fromDate,
      todate: value,
      search,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateURLParams({
        search,
        fromdate: fromDate,
        todate: toDate,
        page,
      });
      setCurrentPage(page);
    }
  };

  if (authLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Attendance  History
        </h3>
      </div>

      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
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
            type="search"
            className="w-full py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-col w-full gap-4 md:flex-row md:w-auto">
          <div className="relative w-full md:w-36">
            <select
              id="floating_class"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={classType}
              onChange={handleClassTypeChange}
            >
              <option value="">All</option>
              <option value="Practical">Practical</option>
              <option value="Theory">Theory</option>
            </select>
            <label
              htmlFor="floating_class"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                classType ? "text-blue-600" : ""
              }`}
            >
              Class Type
            </label>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              From
            </label>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
             min={fromDate || undefined}
              disabled={!fromDate}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              To
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="font-semibold text-center text-blue-600">Loading...</div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-sm text-gray-700 bg-gray-50">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Course Type</th>
                <th className="px-6 py-4">Class Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
                <th className="px-6 py-4">Marked By</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((record, index) => (
                  <tr key={record._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{record.course?.courseName}</td>
                    <td className="px-6 py-4">{record.classType}</td>
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
                      <div className="flex flex-col">
                        <span>{record.createdBy.username}</span>
                        <span
                          className={`text-sm ${
                            record.createdBy.role === "Admin"
                              ? "text-green-500"
                              : record.createdBy.role === "Instructor"
                              ? "text-blue-500"
                              : "text-orange-500"
                          }`}
                        >
                          {record.createdBy.role}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-red-600">
                    Attendance not found
                  </td>
                </tr>
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

export default LearnerSingleAttendance;
