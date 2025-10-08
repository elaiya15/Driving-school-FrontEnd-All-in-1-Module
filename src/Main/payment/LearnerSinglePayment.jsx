import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Pagination from "../../Components/Pagination";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers";

// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>
);
const LearnerSinglePayment = () => {
  const { user, isLoading: authLoading, clearAuthState } = useRole();
  const paymentId = user?.user_id;

  const navigate = useNavigate();
  const location = useLocation();
  const limit = 5;

  const [filters, setFilters] = useState({
    searchTerm: "",
    paymentMethod: "",
    fromDate: "",
    toDate: "",
    currentPage: 1,
  });

  const [payments, setPayments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const didInitFilters = useRef(false);
  const debounceRef = useRef(null);
  const controllerRef = useRef(null);
  const prevSearchValueRef = useRef("");

  const formatDate = (date) => (date ? moment(date).format("YYYY-MM-DD") : "");

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (filters.searchTerm.trim()) params.set("search", filters.searchTerm.trim());
    if (filters.paymentMethod && filters.paymentMethod !== "All")
      params.set("paymentMethod", filters.paymentMethod);
    if (filters.fromDate) params.set("fromdate", formatDate(filters.fromDate));
    if (filters.toDate) params.set("todate", formatDate(filters.toDate));
    params.set("page", filters.currentPage);
    params.set("limit", limit);
    navigate({ search: params.toString() }, { replace: true });
  };

  const fetchPayments = async () => {
    if (!paymentId) return;

    const { searchTerm, paymentMethod, fromDate, toDate, currentPage } = filters;

    if ((fromDate && !toDate) || (!fromDate && toDate)) return;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) return;

    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/v2/payments/${paymentId}`, {
       ...branchHeaders(),
        params: {
          search: searchTerm.trim() || undefined,
          paymentMethod: paymentMethod || undefined,
          fromdate: formatDate(fromDate),
          todate: formatDate(toDate),
          page: currentPage,
          limit,
        },
        signal: controller.signal,
      });
      setPayments(res.data.payments);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error(err);
        // ✅ 401 handling
           if (err.response?.status === 401|| err.response?.status === 403) {
          setErrorMsg(err.response?.data?.message||err.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            setErrorMsg();
          }, 2000);
        } else {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.errors?.join(", ") ||
            "Something went wrong!";
          setErrorMsg(msg);
          setTimeout(() => setErrorMsg(""), 4000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // On first mount, initialize filters from URL
  useEffect(() => {
    if (authLoading || !paymentId || didInitFilters.current) return;

    const params = new URLSearchParams(location.search);
    const searchTerm = params.get("search") || "";
    const paymentMethod = params.get("paymentMethod") || "";
    const fromDate = params.get("fromdate") || "";
    const toDate = params.get("todate") || "";
    const currentPage = parseInt(params.get("page")) || 1;

    didInitFilters.current = true;
    setFilters({
      searchTerm,
      paymentMethod,
      fromDate,
      toDate,
      currentPage,
    });
  }, [authLoading, paymentId]);

  // Watch filters and trigger fetch
  useEffect(() => {
    if (!didInitFilters.current || !paymentId) return;

    const { searchTerm, fromDate, toDate } = filters;

    if ((fromDate && !toDate) || (!fromDate && toDate)) return;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) return;

    updateURLParams();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmedSearch = searchTerm.trim();
    const prev = prevSearchValueRef.current;

    // Detect paste without debounce
    const isPaste =
      trimmedSearch.length > prev.length + 1 &&
      trimmedSearch.includes(prev) &&
      trimmedSearch.indexOf(prev) === 0;

    prevSearchValueRef.current = trimmedSearch;

    if (trimmedSearch && !isPaste) {
      debounceRef.current = setTimeout(() => {
        fetchPayments();
      }, 1500);
    } else {
      fetchPayments(); // No debounce on paste or empty
    }

    return () => clearTimeout(debounceRef.current);
  }, [
    filters.searchTerm,
    filters.paymentMethod,
    filters.fromDate,
    filters.toDate,
    filters.currentPage,
  ]);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "fromDate" && value === "") {
      setFilters((prev) => ({
        ...prev,
        fromDate: "",
        toDate: "",
        currentPage: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
        currentPage: 1,
      }));
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, currentPage: page }));
  };

 return (
  <div className="p-4">
    <h3 className="mb-4 text-xl font-bold">Payment History</h3>


        {errorMsg && <Toast message={errorMsg} />}


    {/* Search and Filters */}
   <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
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
          placeholder="Search..."
          value={filters.searchTerm}
          onChange={handleChange("searchTerm")}
          className="w-full py-2 pl-10 pr-4 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col w-full gap-4 md:flex-row md:w-auto">
        {/* Payment Method */}
        <div className="relative w-full md:w-40">
          <select
            value={filters.paymentMethod}
            onChange={handleChange("paymentMethod")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">All</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
          </select>
          <label
            htmlFor="floating_payment"
            className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 ${
              filters.paymentMethod ? "text-blue-600" : ""
            }`}
          >
            Payment
          </label>
        </div>

        {/* From Date */}
        <div className="relative w-full md:w-40">
          <input
            type="date"
            value={filters.fromDate}
            onChange={handleChange("fromDate")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
          <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
            From
          </label>
        </div>

        {/* To Date */}
        <div className="relative w-full md:w-40">
          <input
            type="date"
            value={filters.toDate}
            onChange={handleChange("toDate")}
            disabled={!filters.fromDate}
            min={filters.fromDate || undefined}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring focus:border-blue-300"
          />
          <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
            To
          </label>
        </div>
      </div>
    </div>

    {/* Table */}
    {loading ? (
      <div className="text-center text-blue-600">Loading...</div>
    ) : (
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-sm text-gray-700 bg-gray-50">
            <tr>
              <th className="px-6 py-4">S.No</th>
              <th className="px-6 py-4">Payment Method</th>
              <th className="px-6 py-4">Amount ₹</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment._id} className="bg-white border-b">
                  <td className="px-6 py-4">
                    {(filters.currentPage - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4">{payment.paymentMethod}</td>
                  <td className="px-6 py-4">{payment.amount}</td>
                  <td className="px-6 py-4">
                    {moment(payment.date).format("DD-MM-YYYY")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-red-800">
                  Payments not found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {payments.length > 0 && (
          <Pagination
            CurrentPage={filters.currentPage}
            TotalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    )}
  </div>
);

};

export default LearnerSinglePayment;
