import { useState, useEffect } from "react";
import { URL } from "../../App";
import Pagination from "../../Components/Pagination";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { FaSyncAlt } from "react-icons/fa";
import { useRole } from "../../Components/AuthContext/AuthContext";

const SingleTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [testType, setTestType] = useState("");
  const [result, setResult] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 5;

  const formatDate = (date) =>
    date ? new Date(date).toISOString().split("T")[0] : "";

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 2000);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
      
        const queryParams = {
          page: currentPage,
          testType,
          result,
          fromdate: formatDate(fromDate),
          todate: formatDate(toDate),
          search: debouncedSearchQuery,
          limit,
        };

        const { data } = await axios.get(`${URL}/api/tests/${id}`, {
          withCredentials: true,
          params: queryParams,
          signal: controller.signal,
        });

        setTests(data.tests || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          setTimeout(() => {
            clearAuthState();
            navigate("/");
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [
    debouncedSearchQuery,
    testType,
    result,
    fromDate,
    toDate,
    currentPage,
    id,
  ]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleRefresh = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setTestType("");
    setResult("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-base font-semibold">Test History</h3>
        <FaSyncAlt
          className="text-blue-500 cursor-pointer hover:text-blue-600"
          onClick={handleRefresh}
          size={20}
          aria-label="Refresh Tests"
        />
      </div>

      <div className="flex flex-col md:flex-row font-light text-gray-900  whitespace-nowrap dark:text-white md:items-center justify-between space-y-2 md:space-y-0 mb-4 relative text-sm">
        <div className="flex w-full md:w-1/3 relative md:mr-4">
          <div
            className="absolute inset-y-0 left-3 flex items-center  pointer-events-none"
            aria-label="Search Icon"
          >
            <svg
              className="w-4 h-4 text-gray-500"
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
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 pr-10 py-2"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search Input"
          />

          {searchQuery && (
            <button
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setSearchQuery("")}
              aria-label="Clear Search"
            >
              <svg
                className="w-4 h-4 text-gray-500 hover:text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 6l8 8m0-8l-8 8"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4 w-full md:w-auto gap-2 mt-2 md:mt-0 md:ml-auto justify-end">
          <div className="relative w-full sm:w-36">
            <select
              id="floating_result"
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            >
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label
              htmlFor="floating_result"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${result ? "text-blue-600" : ""}`}
            >
              Result Type
            </label>
          </div>
          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              From
            </label>
          </div>
          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              To
            </label>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5 text-blue-600 font-semibold text-lg">
          Loading...
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-sm text-gray-700 text-left bg-gray-50">
              <tr className="">
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Test Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-red-600 py-6 bg-white"
                  >
                    Tests not found
                  </td>
                </tr>
              ) : (
                tests.map((test, index) => (
                  <tr
                    key={test._id}
                    className="bg-white text-left border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4">{test.testType}</td>
                    <td className="px-6 py-4">
                      {moment(test.date).format("DD-MM-YYYY")}
                    </td>
                    <td
                      className={`px-6 py-4 ${
                        test.result === "Pass"
                          ? "text-green-600"
                          : test.result === "Scheduled"
                          ? "text-blue-600"
                          : test.result === "Fail"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {test.result}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          navigate(`/admin/test-details/${test._id}/edit`, {
                            state: { test },
                          })
                        }
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {tests.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SingleTest;
