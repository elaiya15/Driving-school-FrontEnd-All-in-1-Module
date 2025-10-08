import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Pagination";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers";

// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>
);
const LearnerSingleAssign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user,clearAuthState } = useRole();
  const controllerRef = useRef(null);

  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusOne, setStatusOne] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const limit = 5;

  // Sync state from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const statusOneFromURL = params.get("statusOne") || "";
    const statusTwoFromURL = params.get("statusTwo") || "";
    const pageFromURL = parseInt(params.get("page")) || 1;

    setSearch(searchFromURL);
    setStatusOne(statusOneFromURL);
    setStatusTwo(statusTwoFromURL);
    setCurrentPage(pageFromURL||1);

    // Always include page and limit in URL
    updateURLParams({
      search: searchFromURL,
      statusOne: statusOneFromURL,
      statusTwo: statusTwoFromURL,
      page: pageFromURL,
    });
  }, []);

  // Update URL params
  const updateURLParams = ({ search, statusOne, statusTwo, page }) => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (statusOne) params.set("statusOne", statusOne);
    if (statusTwo) params.set("statusTwo", statusTwo);

    params.set("page", page || 1);   // Always include page
    params.set("limit", limit);      // Always include limit

    navigate({ search: params.toString() }, { replace: true });
  };

  // Fetch data from API
  const fetchData = async (queryParams) => {
    if (!user?.user_id) return;

    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/v2/course-assigned/${user.user_id}?${queryParams}`,
        {  ...branchHeaders(), signal: controller.signal }
      );
      setAssignments(response.data.assignments || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
           // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
          setErrorMsg(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            setErrorMsg("");
          }, 2000);
        }

          // ✅ Handle custom error messages
          const errorData = error?.response?.data;
          const errors = errorData?.errors || errorData?.message || "An error occurred";

          if (Array.isArray(errors)) {
            setErrorMsg(errors.join(", "));
          } else {
            setErrorMsg(errors);
          }

          // ✅ Auto-clear error toast
          setTimeout(() => {
            setErrorMsg("");
          }, 4000);
        }
      } finally {
      setLoading(false);
    }
  };

  // Debounced fetch for search
  const debounceRef = useRef(null);
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (search) queryParams.set("search", search);
    if (statusOne) queryParams.set("statusOne", statusOne);
    if (statusTwo) queryParams.set("statusTwo", statusTwo);

    queryParams.set("page", currentPage); // Always include page
    queryParams.set("limit", limit);      // Always include limit

    if (search) {
      debounceRef.current = setTimeout(() => {
        fetchData(queryParams.toString());
      }, 2000);
    } else {
      fetchData(queryParams.toString());
    }

    return () => clearTimeout(debounceRef.current);
  }, [search, statusOne, statusTwo, currentPage]);

  // Handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
    updateURLParams({ search: value, statusOne, statusTwo, page: 1 });
  };

  const handleStatusOneChange = (e) => {
    const value = e.target.value;
    setStatusOne(value);
    setCurrentPage(1);
    updateURLParams({ search, statusOne: value, statusTwo, page: 1 });
  };

  const handleStatusTwoChange = (e) => {
    const value = e.target.value;
    setStatusTwo(value);
    setCurrentPage(1);
    updateURLParams({ search, statusOne, statusTwo: value, page: 1 });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({ search, statusOne, statusTwo, page });
    }
  };

  return (
    <div className="p-4">
              {errorMsg && <Toast message={errorMsg} />}

      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold">Course  History</h3>
      </div>

      <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search"
            className="w-full py-2 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
          />
          <svg className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
          {search && (
            <button className="absolute inset-y-0 text-gray-500 right-3" onClick={() => handleSearchChange({ target: { value: "" } })}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeWidth="2" d="M6 6l8 8M6 14L14 6" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex w-full gap-4 md:w-auto">
          <div className="relative w-full md:w-48">
            <select
              value={statusOne}
              onChange={handleStatusOneChange}
              className="block w-full px-3 py-2 text-sm bg-transparent border border-gray-300 rounded-lg peer"
            >
              <option value="">All</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <label className={`absolute text-xs left-3 top-[-8px] bg-white px-1 ${statusOne ? "text-blue-600" : "text-gray-500"}`}>
              Status
            </label>
          </div>

          <div className="relative w-full md:w-48">
            <select
              value={statusTwo}
              onChange={handleStatusTwoChange}
              className="block w-full px-3 py-2 text-sm bg-transparent border border-gray-300 rounded-lg peer"
            >
              <option value="">All</option>
              <option value="Ready to test">Ready to test</option>
              <option value="Extra class">Extra class</option>
            </select>
            <label className={`absolute text-xs left-3 top-[-8px] bg-white px-1 ${statusTwo ? "text-blue-600" : "text-gray-500"}`}>
              Description
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
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Duration (Days)</th>
                <th className="px-6 py-4">Remaining (Days)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length ? (
                assignments.map((assignment, index) => (
                  <tr key={assignment._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{assignment.course?.courseName || "--"}</td>
                    <td className="px-6 py-4">{assignment.course?.duration ?? "--"}</td>
                    <td className="px-6 py-4">
                      {assignment.course?.duration != null
                        ? assignment.course.duration - assignment.attendedDays
                        : "--"}
                    </td>
                    <td className={`px-6 py-4 ${assignment.statusOne === "Completed"
                      ? "text-green-600"
                      : assignment.statusOne === "Processing"
                      ? "text-blue-600"
                      : "text-red-600"}`}>
                      {assignment.statusOne}
                    </td>
                    <td className="px-6 py-4">{assignment.statusTwo || "--"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-red-500 bg-white border-b">
                    No course assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {assignments.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default LearnerSingleAssign;
