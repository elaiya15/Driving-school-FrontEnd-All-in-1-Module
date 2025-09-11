import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers.jsx";
const TestTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, setUser, setRole, clearAuthState } = useRole();

  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [testType, setTestType] = useState("");
  const [result, setResult] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(10);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const lastPasteRef = useRef(0);

  const updateURLParams = (params) => {
    const query = new URLSearchParams();
    if (params.search?.trim()) query.set("search", params.search.trim());
    if (params.testType) query.set("testType", params.testType);
    if (params.result) query.set("result", params.result);
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate) query.set("toDate", params.toDate);
    query.set("page", params.page || 1);
    query.set("limit", limit);
    navigate({ search: query.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
    setTestType(params.get("testType") || "");
    setResult(params.get("result") || "");
    setFromDate(params.get("fromDate") || "");
    setToDate(params.get("toDate") || "");
    setCurrentPage(Number(params.get("page")) || 1);
  }, [location.search]);

  const fetchTests = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = {
        search: searchQuery || undefined,
        testType: testType || undefined,
        result: result || undefined,
        fromdate: fromDate && toDate ? fromDate : undefined,
        todate: fromDate && toDate ? toDate : undefined,
        page: currentPage,
        limit,
      };
      const response = await axios.get(`${URL}/api/v2/tests`, {
        ...branchHeaders(),
        params,
        signal: controller.signal,
        
      });
      setTests(response.data.tests || []);

      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      if (
        error.name !== "CanceledError" &&
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message === "Credential Invalid or Expired Please Login Again")
      ) {
        setTimeout(() => {
          clearAuthState();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const now = Date.now();
    const isPaste = now - lastPasteRef.current < 100;

    if (isPaste) {
      fetchTests();
    } else {
      debounceRef.current = setTimeout(fetchTests, searchQuery ? 2000 : 0);
    }
  }, [searchQuery, testType, result, fromDate, toDate, currentPage]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    updateURLParams({ search: value, testType, result, fromDate, toDate, page: 1 });
  };

  const handlePaste = () => {
    lastPasteRef.current = Date.now();
  };

  const handleTestTypeChange = (e) => {
    const value = e.target.value;
    setTestType(value);
    setCurrentPage(1);
    updateURLParams({ search: searchQuery, testType: value, result, fromDate, toDate, page: 1 });
  };

  const handleResultChange = (e) => {
    const value = e.target.value;
    setResult(value);
    setCurrentPage(1);
    updateURLParams({ search: searchQuery, testType, result: value, fromDate, toDate, page: 1 });
  };

  const handleFromDateChange = (e) => {
  const value = e.target.value;
  setFromDate(value);

  // If fromDate is cleared, also clear toDate
  if (!value) {
    setToDate("");
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate: "",
      toDate: "",
      page: 1,
    });
  } else {
    // Keep toDate as is if fromDate is set
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate: value,
      toDate,
      page: 1,
    });
  }

  setCurrentPage(1);
};

const handleToDateChange = (e) => {
  const value = e.target.value;
  setToDate(value);
if (!value) {
    setToDate("");
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate: "",
      toDate: "",
      page: 1,
    });
  } else {
    
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate,
      toDate:value,
      page: 1,
    });
  }

  setCurrentPage(1);
};


  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams({ search: searchQuery, testType, result, fromDate, toDate, page });
  };



  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">
          Test Details
        </h3>
        <button
          onClick={() => navigate("/admin/test-details/new")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Add Test
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
  {/* Search Field */}
  <div className="w-full lg:w-1/4">
    <div className="relative">
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
        className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        onPaste={handlePaste}
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
            });
          }}
        >
          <svg
            className="w-5 h-5"
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
  </div>

  {/* Filters Section */}
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:w-auto md:justify-between lg:justify-start" >
    {/* Test Type */}
    <div className="relative w-full sm:w-36">
      <select
        id="floating_testType"
        className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
        value={testType}
        onChange={handleTestTypeChange}
      >
        <option value="">All</option>
        <option value="Theory Test">Theory Test</option>
        <option value="Practical Test">Practical Test</option>
      </select>
      <label
        htmlFor="floating_testType"
        className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
          testType ? "text-blue-600" : ""
        }`}
      >
        Test Type
      </label>
    </div>

    {/* Result Type */}
    <div className="relative w-full sm:w-36">
      <select
        id="floating_result"
        className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
        value={result}
        onChange={handleResultChange}
      >
        <option value="">All</option>
        <option value="Scheduled">Scheduled</option>
        <option value="Pass">Pass</option>
        <option value="Fail">Fail</option>
      </select>
      <label
        htmlFor="floating_result"
        className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
          result ? "text-blue-600" : ""
        }`}
      >
        Result Type
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
      <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">From</label>
    </div>

    {/* To Date */}
    <div className="relative w-full sm:w-40">
      <input
        type="date"
        value={toDate}
        onChange={handleToDateChange}
        onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
        min={fromDate || undefined}
        disabled={!fromDate}
        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">To</label>
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
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Profile</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-4 py-2">Test Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.length > 0 ? (
                tests.map((test, index) => (
                  <tr
                    key={test._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="py-4 sm:px-2">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(
                          test.learner?.photo
                        )}`}
                        alt={test.learner?.fullName}
                        // className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"
                          className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"

                      />
                    </td>
                    <td className="px-6 py-4">{test.learner?.fullName}</td>
                    <td className="px-6 py-4">
                      {test.learner?.admissionNumber}
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
                          navigate(`/admin/test-details/${test._id}/edit`)
                        }
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <i className="text-blue-600 fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-red-600">
                    Tests not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
           {totalPages  > 0 && (
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

export default TestTable;
