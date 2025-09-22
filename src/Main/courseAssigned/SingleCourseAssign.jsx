import { useState, useEffect } from "react";
import { URL } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Pagination from "../../Components/Pagination";
import { FaSyncAlt } from "react-icons/fa";
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust path as needed
import branchHeaders from "../../Components/utils/headers";
const SingleCourseAssign = () => {
    const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const { id } = useParams();
  const navigate = useNavigate();
  const [learners, setLearners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusOne, setStatusOne] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 5;

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);

      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          statusOne,
          statusTwo,
          search,
          limit,
        });

        const response = await axios.get(
          `${URL}/api/v2/course-assigned/${id}?${queryParams}`,
          {
                                   ...branchHeaders(),

            signal: controller.signal,
          }
        );

        setLearners(response.data.assignments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
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
      } finally {
        setLoading(false);
      }
    };

    let debounceTimeout;

    if (search) {
      debounceTimeout = setTimeout(() => {
        fetchData();
      }, 2000);
    } else {
      fetchData();
    }

    return () => {
      controller.abort();
      clearTimeout(debounceTimeout);
    };
  }, [currentPage, search, statusOne, statusTwo]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleRefresh = () => {
    setSearch("");
    setStatusOne("");
    setStatusTwo("");
    setCurrentPage(1);
  };

  return (
    <>
      <div className="p-4 ">
        <div className="flex flex-row items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-semibold">Course History</h3>
          <FaSyncAlt
            className="text-blue-500 cursor-pointer hover:text-blue-600"
            onClick={handleRefresh}
            size={20}
            aria-label="Refresh Tests"
          />
        </div>

        <div className="flex flex-col justify-between mb-4 space-y-2 md:flex-row md:items-center md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              className="w-full py-2 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                onClick={() => setSearch("")}
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

          <div className="flex flex-col w-full gap-3 md:flex-row md:w-auto">
            <div className="relative w-full lg:w-48">
              <select
                id="floating_status_one"
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
                value={statusOne}
                onChange={(e) => setStatusOne(e.target.value)}
              >
                <option value="">All</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <label
                htmlFor="floating_status_one"
                className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${statusOne ? "text-blue-600" : ""}`}
              >
                Status
              </label>
            </div>

            <div className="relative w-full md:w-48">
              <select
                id="floating_status_two"
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
                value={statusTwo}
                onChange={(e) => setStatusTwo(e.target.value)}
              >
                <option value="">All</option>
                <option value="Ready to test">Ready to test</option>
                <option value="Extra class">Extra class</option>
              </select>
              <label
                htmlFor="floating_status_two"
                className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${statusTwo ? "text-blue-600" : ""}`}
              >
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
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-sm text-left text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Duration (Days)</th>
                  <th className="px-6 py-4">Remaining (Days)</th>
                  <th className="px-6 py-4">Status </th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.length > 0 ? (
                  learners.map((assignment, index) => (
                    <tr key={assignment._id} className="bg-white border-b">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">
                        {assignment.course.courseName}
                      </td>
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
                      <td className="px-6 py-4">
                        {assignment.statusTwo || "--"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/course-assigned/${assignment._id}/edit`,
                              { state: { assignment } }
                            )
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
                    <td
                      colSpan="7"
                      className="py-6 text-center text-red-600 bg-white border-b"
                    >
                      Courses not found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {learners.length > 0 && (
          <Pagination
            CurrentPage={currentPage}
            TotalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
};

export default SingleCourseAssign;
