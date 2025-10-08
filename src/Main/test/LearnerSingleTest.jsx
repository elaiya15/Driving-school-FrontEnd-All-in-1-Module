import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
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
const LearnerSingleTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, setUser, setRole, clearAuthState } = useRole();
  const [errorMsg, setErrorMsg] = useState("");

  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [testType, setTestType] = useState("");
  const [result, setResult] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // for error message

  const searchDebounceRef = useRef(null);
  const controllerRef = useRef(null);

  const formatDate = (date) =>
    date ? new Date(date).toISOString().split("T")[0] : "";

  const updateURLParams = ({
    search,
    testType,
    result,
    fromDate,
    toDate,
    page,
    limit,
  }) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (testType) params.set("testType", testType);
    if (result) params.set("result", result);
    if (fromDate) params.set("fromdate", formatDate(fromDate));
    if (toDate) params.set("todate", formatDate(toDate));
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    navigate({ search: params.toString() });
  };

  const fetchTests = async () => {
    if (!user?.user_id) return;

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    if ((fromDate && !toDate) || (!fromDate && toDate)) return;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${URL}/api/v2/tests/${user.user_id}`, {
       ...branchHeaders(),
        signal: controllerRef.current.signal,
        params: {
          page: currentPage,
          limit,
          ...(searchQuery ? { search: searchQuery } : {}),
          ...(testType ? { testType } : {}),
          ...(result ? { result } : {}),
          ...(fromDate ? { fromdate: formatDate(fromDate) } : {}),
          ...(toDate ? { todate: formatDate(toDate) } : {}),
        },
      });

      setTests(response.data.tests || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
             // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
          setErrorMsg([error.response?.data?.message||error.response?.data?.error ]);
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
      }  finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const testType = params.get("testType") || "";
    const result = params.get("result") || "";
    const from = params.get("fromdate") || "";
    const to = params.get("todate") || "";
    const page = parseInt(params.get("page")) || 1;
    const lim = parseInt(params.get("limit")) || 5;

    setSearchQuery(search);
    setTestType(testType);
    setResult(result);
    setFromDate(from);
    setToDate(to);
    setCurrentPage(page);
    setLimit(lim);

    updateURLParams({
      search,
      testType,
      result,
      fromDate: from,
      toDate: to,
      page,
      limit: lim,
    });
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      fetchTests();
    } else {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

      searchDebounceRef.current = setTimeout(() => {
        fetchTests();
      }, 1500);
    }

    return () => {
      if (controllerRef.current) controllerRef.current.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [
    searchQuery,
    testType,
    result,
    fromDate,
    toDate,
    currentPage,
    limit,
    user?.user_id,
  ]);

  const handleSearch = (e) => {
    const val = e.target.value;
    const cleanVal =
      val.length % 2 === 0 &&
      val.substring(0, val.length / 2) === val.substring(val.length / 2)
        ? val.substring(0, val.length / 2)
        : val;

    setSearchQuery(cleanVal);
    setCurrentPage(1);
    updateURLParams({
      search: cleanVal,
      testType,
      result,
      fromDate,
      toDate,
      page: 1,
      limit,
    });
  };

  const handlePasteSearch = (e) => {
    const pastedText = e.clipboardData.getData("text");
    setSearchQuery(pastedText);
    setCurrentPage(1);

    updateURLParams({
      search: pastedText,
      testType,
      result,
      fromDate,
      toDate,
      page: 1,
      limit,
    });

    fetchTests(); // instant fetch on paste
  };

  const handleTestTypeChange = (e) => {
    const val = e.target.value;
    setTestType(val);
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType: val,
      result,
      fromDate,
      toDate,
      page: 1,
      limit,
    });
  };

  const handleResultChange = (e) => {
    const val = e.target.value;
    setResult(val);
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType,
      result: val,
      fromDate,
      toDate,
      page: 1,
      limit,
    });
  };

  const handleFromDateChange = (e) => {
    const val = e.target.value;
    setFromDate(val);
    setToDate("");
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate: val,
      toDate: "",
      page: 1,
      limit,
    });
  };

  const handleToDateChange = (e) => {
    const val = e.target.value;
    setToDate(val);
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate,
      toDate: val,
      page: 1,
      limit,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate,
      toDate,
      page,
      limit,
    });
  };

  return (
    <div className="p-6">
              {errorMsg && <Toast message={errorMsg} />}

      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">Test History</h3>
      </div>

      
             

      <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-64">
          <svg
            className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            <circle cx="10" cy="10" r="7" />
          </svg>

          <input
            type="text"
            className="w-full py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            onPaste={handlePasteSearch}
          />

          {searchQuery && (
            <button
              className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-blue-500"
              onClick={() => {
                setSearchQuery("");
                updateURLParams({
                  search: "",
                  testType,
                  result,
                  fromDate,
                  toDate,
                  page: 1,
                  limit,
                });
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col w-full gap-4 sm:grid sm:grid-cols-2 md:flex md:flex-row md:w-auto">
          <div className="relative w-full md:w-36">
            <select
              id="floating_testType"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={testType}
              onChange={handleTestTypeChange}
            >
              <option value="">All</option>
              <option value="Theory Test">Theory Test</option>
              <option value="Practical Test">Practical Test</option>
            </select>
            <label htmlFor="floating_testType" className="absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500">
              Test Type
            </label>
          </div>

          <div className="relative w-full md:w-36">
            <select
              id="floating_result"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={result}
              onChange={handleResultChange}
            >
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label htmlFor="floating_result" className="absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500">
              Result Type
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
      ) : tests.length === 0 ? (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-sm text-gray-700 bg-gray-50">
              <tr className="bg-gray-100">
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Test Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-red-600">
                  Tests not found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-sm text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Test Type</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, index) => (
                  <tr key={test._id} className="bg-white border-b">
                    <td className="px-6 py-4">{(currentPage - 1) * limit + index + 1}</td>
                    <td className="px-6 py-4">{test.testType}</td>
                    <td className="px-6 py-4">{moment(test.date).format("DD-MM-YYYY")}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            CurrentPage={currentPage}
            TotalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default LearnerSingleTest;
