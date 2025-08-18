import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Pagination";
import { useRole } from "../../Components/AuthContext/AuthContext";
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>
);
const CourseTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, setUser, setRole, clearAuthState } = useRole();
const [errorMsg, setErrorMsg] = useState("");
// const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const skipNextChangeRef = useRef(false); // 🔁 Prevent double paste
  const abortControllerRef = useRef(null); // 🛑 For AbortController

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get("search") || "",
      page: parseInt(params.get("page")) || 1,
      limit: parseInt(params.get("limit")) || itemsPerPage,
    };
  }, [location.search]);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(query.page);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(query.search);

  // URL Param validation on first load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let updated = false;

    if (!params.has("page")) {
      params.set("page", "1");
      updated = true;
    }
    if (!params.has("limit")) {
      params.set("limit", String(itemsPerPage));
      updated = true;
    }
    if (!params.get("search")?.trim()) {
      params.delete("search");
      updated = true;
    }

    if (updated) {
      navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true });
    }
  }, []);

  useEffect(() => {
    setSearchTerm(query.search);
    setCurrentPage(query.page);
  }, [query.search, query.page]);

  useEffect(() => {
    // Abort previous fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const isPaste = skipNextChangeRef.current;
    const debounceDelay = isPaste ? 0 : 1500;
    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (query.search.trim()) queryParams.set("search", query.search);
        queryParams.set("page", query.page);
        queryParams.set("limit", query.limit);

        const response = await axios.get(`${URL}/api/courses?${queryParams.toString()}`, {
          withCredentials: true,
          signal: controller.signal,
        });

        setCourses(response.data.courses || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data?.message ===
                "Credential Invalid or Expired Please Login Again")
          ) {
            setErrorMsg("Credential Invalid or Expired Please Login Again");
            return setTimeout(() => {
              clearAuthState();
              setErrorMsg("")
            }, 2000);
          }

          // ✅ Handle custom error messages
          const errorData = error?.response?.data;
          const errors = errorData?.errors || errorData?.message ;

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
        skipNextChangeRef.current = false;
        setLoading(false);
      }
    }, debounceDelay);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query.search, query.page, query.limit]);

  const handleSearchChange = (e) => {
    if (skipNextChangeRef.current) {
      skipNextChangeRef.current = false;
      return;
    }

    const value = e.target.value;
    setSearchTerm(value);

    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  const handleSearchPaste = (e) => {
    e.preventDefault(); // Stop default paste behavior
    const pastedText = e.clipboardData.getData("text");

    if (!pastedText) return;

    skipNextChangeRef.current = true; // Avoid next onChange
    setSearchTerm(pastedText);

    const params = new URLSearchParams(location.search);
    params.set("search", pastedText);
    params.set("page", "1");
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(page));
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  return (
    <div className="p-4">
              {errorMsg && <Toast message={errorMsg} />}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">Course Details</h3>
        <button
          onClick={() => navigate("/admin/Course/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Add Course
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div className="relative w-full md:w-1/3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.85-6.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
            />
          </svg>
          <input
            type="search"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 pl-10 py-2"
            placeholder="Search Course"
            value={searchTerm}
            onChange={handleSearchChange}
            onPaste={handleSearchPaste}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-blue-600 font-semibold text-lg">Loading...</div>
      ) : errorMessage ? (
        <p className="text-red-600 text-center py-5">{errorMessage}</p>
      ) : (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-sm text-gray-700 text-left bg-gray-50">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Duration (Days)</th>
                <th className="px-6 py-4">Practical (Days)</th>
                <th className="px-6 py-4">Theory (Days)</th>
                <th className="px-6 py-4">Fees (₹)</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <tr key={course._id} className="bg-white border-b">
                    <td className="px-6 py-4">
                      {(query.page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">{course.courseName}</td>
                    <td className="px-6 py-4">{course.duration}</td>
                    <td className="px-6 py-4">{course.practicalDays}</td>
                    <td className="px-6 py-4">{course.theoryDays}</td>
                    <td className="px-4 py-2">{course.fee}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/Course/${course._id}/edit`)}
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-red-600 py-4">
                    Course not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {courses.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CourseTable;
