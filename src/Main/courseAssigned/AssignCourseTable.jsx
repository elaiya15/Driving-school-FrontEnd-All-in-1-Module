
 import { useState, useEffect, useRef } from "react";
import { URL } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers.jsx";

const AssignCourseTable = () => {
  const navigate = useNavigate();
  const { role, user, setUser, setRole, clearAuthState } = useRole();
  const location = useLocation();
  const [learners, setLearners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusOne, setStatusOne] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [loading, setLoading] = useState(true);
  const abortRef = useRef(null);
  const pasteTriggered = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let updated = false;

    if (!params.has("page")) {
      params.set("page", 1);
      updated = true;
    }

    if (!params.has("limit")) {
      params.set("limit", limit);
      updated = true;
    }

    if (updated) navigate({ search: params.toString() }, { replace: true });
  }, []);

  const updateURLParams = ({ search, statusOne, statusTwo, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      if (search.length >= 3) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
    }

    if (statusOne !== undefined) {
      statusOne ? params.set("statusOne", statusOne) : params.delete("statusOne");
    }

    if (statusTwo !== undefined) {
      statusTwo ? params.set("statusTwo", statusTwo) : params.delete("statusTwo");
    }

    if (page !== undefined) {
      page > 1 ? params.set("page", page) : params.delete("page");
    }

    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setStatusOne(params.get("statusOne") || "");
    setStatusTwo(params.get("statusTwo") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);
  }, [location.search]);

  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${URL}/api/v2/course-assigned`, {
         ...branchHeaders(),
          params: {
            search: search.length >= 3 ? search : undefined,
            statusOne: statusOne || undefined,
            statusTwo: statusTwo || undefined,
            page: currentPage,
            limit,
          },
          signal: controller.signal,
        });

        setLearners(response.data.assignments || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (axios.isCancel(error) || error.name === "AbortError") {
          console.log("Search request aborted");
        } else {
          console.error("Error fetching data:", error);
              // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
        //   setErrorMsg(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            // setErrorMsg("");
          }, 2000);
        }
        }
      } finally {
        setLoading(false);
      }
    };

    if (search.length >= 3 || search.length === 0) {
      if (pasteTriggered.current) {
        pasteTriggered.current = false;
        fetchData();
      } else {
        const timeout = setTimeout(fetchData, 1500);
        return () => clearTimeout(timeout);
      }
    }

    return () => controller.abort();
  }, [search, currentPage, statusOne, statusTwo]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
    updateURLParams({ search: value, statusOne, statusTwo, page: 1 });
  };

  const handleSearchPaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData("text").trim();
    pasteTriggered.current = true;
    setSearch(pastedText);
    setCurrentPage(1);
    updateURLParams({ search: pastedText, statusOne, statusTwo, page: 1 });
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
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">
          Course Assigned List
        </h3>
        <button
          onClick={() => navigate("/admin/course-assigned/new")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Add
        </button>
      </div>

      <div className="flex flex-col w-full gap-4 mb-4 md:flex-row md:justify-between md:items-center">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
            onPaste={handleSearchPaste}
            
          />
          <svg
            className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2"
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
          {search && (
            <button
              type="button"
              className="absolute inset-y-0 flex items-center text-gray-500 right-3"
              onClick={() => {
                setSearch("");
                updateURLParams({ search: "", statusOne, statusTwo, page: 1 });
              }}
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 6l8 8M6 14L14 6"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col w-full gap-3 md:flex-row md:w-auto md:justify-end">
          <div className="relative w-full md:w-48">
            <select
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={statusOne}
              onChange={handleStatusOneChange}
            >
              <option value="">All</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <label className="absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600">
              Status
            </label>
          </div>

          <div className="relative w-full md:w-48">
            <select
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={statusTwo}
              onChange={handleStatusTwoChange}
            >
              <option value="">All</option>
              <option value="Ready to test">Ready to test</option>
              <option value="Extra class">Extra class</option>
            </select>
            <label className="absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600">
              Description
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
            <table className="w-full text-sm text-gray-500">
              <thead className="sticky top-0 z-10 text-sm text-left text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Duration (Days)</th>
                  <th className="px-6 py-4">Remaining (Days)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.length > 0 ? (
                  learners.map((assignment, index) => (
                    <tr key={assignment._id} className="bg-white border-b">
                      <th className="px-6 py-4">{index + 1}</th>
                      <td className="px-2 py-4">
                        <img
                          src={`${URL}/api/image-proxy/${extractDriveFileId(
                            assignment.learner.photo
                          )}`}
                          alt="Learner"
                          className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"
                        />
                      </td>
                      <td className="px-6 py-4 truncate" title={assignment.learner.fullName}>
                        {assignment.learner.fullName}
                      </td>
                      <td className="px-6 py-4">{assignment.learner.admissionNumber}</td>
                      <td className="px-6 py-4">{assignment.course.courseName}</td>
                      <td className="px-6 py-4">{assignment.totalDays}</td>
                      <td className="px-6 py-4">
                        {assignment.totalDays - assignment.attendedDays}
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          assignment.statusOne === "Completed"
                            ? "text-green-600"
                            : assignment.statusOne === "Processing"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {assignment.statusOne}
                      </td>
                      <td className="px-6 py-4">{assignment.statusTwo || "--"}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/admin/course-assigned/${assignment._id}/edit`, {
                              state: { assignment },
                            })
                          }
                          className={`text-blue-600 ${
                            assignment.statusOne === "Completed"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={assignment.statusOne === "Completed"}
                        >
                          <i className="text-blue-600 fa-solid fa-pen-to-square"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="py-4 text-center text-red-600">
                      Course assigned not found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {learners.length > 0 && (
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

export default AssignCourseTable;
