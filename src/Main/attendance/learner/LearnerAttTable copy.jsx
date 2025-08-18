import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { URL } from "../../../App";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../../Components/Pagination";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext"; // adjust path as needed

const LearnerAttTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
const {role, user,setUser,setRole,clearAuthState} =  useRole();
  const today = moment().format("YYYY-MM-DD");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const params = new URLSearchParams(location.search);
  const fromDate = params.get("fromdate") || today;
  const toDate = params.get("todate") || today;
  const searchTerm = params.get("search") || "";
  const classType = params.get("classType") || "";
  const date = params.get("date") || "";
  const currentPage = parseInt(params.get("page")) || 1;

  const updateURLParams = (updates) => {
    const updated = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value == null) {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });
    navigate({ search: updated.toString() }, { replace: true });
  };
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const hasFromDate = searchParams.has("fromdate");
  const hasToDate = searchParams.has("todate");

  if (!hasFromDate || !hasToDate) {
    const today = moment().format("YYYY-MM-DD");
    searchParams.set("fromdate", today);
    searchParams.set("todate", today);
    searchParams.set("page", "1");
    searchParams.set("limit", "10");

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    }, { replace: true });
  }
}, []);

  // ⛳️ Fetch Data
  useEffect(() => {
    const controller = new AbortController();
    let debounce;

    const fetchData = async () => {
      if (!fromDate || !toDate) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${URL}/api/learner-attendance`, {
          params: {
            fromdate: fromDate,
            todate: toDate,
            page: currentPage,
            limit,
            classType,
            search: searchTerm.trim(),
            date: date || undefined,
          },
          withCredentials: true,
          signal: searchTerm.trim() ? controller.signal : undefined,
        });

        setAttendanceData(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Fetch error:", error);
          setError(error.message);
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

    if (searchTerm.trim()) {
      debounce = setTimeout(fetchData, 2000);
    } else {
      fetchData();
    }

    return () => {
      if (debounce) clearTimeout(debounce);
      if (searchTerm.trim()) controller.abort();
    };
  }, [location.search]);

  // 🔁 Input Handlers
  const handleSearchChange = (e) => {
    updateURLParams({
      search: e.target.value,
      page: 1,
      date: "",
    });
  };

  const handleFromDateChange = (e) => {
    updateURLParams({
      fromdate: e.target.value,
      page: 1,
    });
  };

  const handleToDateChange = (e) => {
    updateURLParams({
      todate: e.target.value,
      page: 1,
    });
  };

  const handleClassTypeChange = (e) => {
    updateURLParams({
      classType: e.target.value,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateURLParams({
        page,
      });
    }
  };



  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">
          Learner Attendance Details
        </h3>
        <button
          onClick={() => navigate("/admin/attendance/learner/mark")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Mark
        </button>
      </div>

     <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
  {/* Search Field */}
  <div className="w-full lg:w-1/3">
    <div className="relative">
      <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
        <svg
          className="w-4 h-4 mr-2 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search..."
        className="w-full py-2 pl-10 pr-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  </div>

  {/* Filters */}
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap lg:w-auto">
    {/* Class Type */}
    <div className="relative w-full sm:w-36">
      <select
        id="floating_class"
        className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg peer focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        value={classType}
        onChange={handleClassTypeChange}
      >
        <option value="">All</option>
        <option value="Theory">Theory</option>
        <option value="Practical">Practical</option>
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

    {/* From Date */}
    <div className="relative w-full sm:w-40">
      <input
        type="date"
        value={fromDate}
        onChange={handleFromDateChange}
        onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
      />
      <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
        From
      </label>
    </div>

    {/* To Date */}
    <div className="relative w-full sm:w-40">
      <input
        type="date"
        value={toDate}
        onChange={handleToDateChange}
        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
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
        <>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-sm text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4">Course Type</th>
                  <th className="px-6 py-4">Class Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Marked By</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((item, index) => (
                    <tr key={index} className="bg-white border-b">
                      <td className="px-6 py-4">
                        {index + 1 + (currentPage - 1) * limit}
                      </td>
                      <td className="px-6 py-4">
                        <img
                          src={`${URL}/api/image-proxy/${extractDriveFileId(
                            item.learner.photo
                          )}`}
                          alt={item.learner.fullName}
                          className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"
                        />
                      </td>
                      <td className="px-6 py-4">{item.learner.fullName}</td>
                      <td className="px-6 py-4">
                        {item.learner.admissionNumber}
                      </td>
                      <td className="px-6 py-4">{item.course.courseName}</td>
                      <td className="px-6 py-4">{item.classType}</td>
                      <td className="px-6 py-4">
                        {item?.date
                          ? moment(item?.date).format("DD-MM-YYYY")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {item.checkIn
                          ? moment(item.checkIn).format("hh:mm A")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {item.checkOut
                          ? moment(item.checkOut).format("hh:mm A")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{item.createdBy.username}</span>
                          {item.createdBy.role.toLowerCase() === "admin" ? (
                            <span className="text-sm text-green-500 capitalize">
                              {item.createdBy.role}
                            </span>
                          ) : (
                            <a
                              href={`/admin/${item.createdBy.role.toLowerCase()}/${
                                item.createdBy.refDetails._id
                              }/view`}
                              className={`text-sm hover:underline ${
                                item.createdBy.role.toLowerCase() ===
                                "instructor"
                                  ? "text-blue-500"
                                  : "text-orange-500"
                              } capitalize`}
                            >
                              {item.createdBy.role}
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-4 text-center text-red-600">
                      Attendance not found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && attendanceData.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LearnerAttTable;
