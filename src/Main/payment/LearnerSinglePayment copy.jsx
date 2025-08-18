import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Pagination from "../../Components/Pagination";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext";

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

  const didInitFilters = useRef(false);
  const debounceRef = useRef(null);
  const controllerRef = useRef(null);

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

    // Cancel previous request
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/payments/${paymentId}`, {
        withCredentials: true,
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
        if (err.response?.status === 401) {
          clearAuthState();
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ First load: read URL, set filters (no API call)
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

  // ✅ Main trigger: when filters change (after initial), call API
  useEffect(() => {
    if (!didInitFilters.current || !paymentId) return;

    const { searchTerm, fromDate, toDate } = filters;

    // Prevent invalid date range
    if ((fromDate && !toDate) || (!fromDate && toDate)) return;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) return;

    updateURLParams();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchTerm.trim()) {
      // Debounced API call for search
      debounceRef.current = setTimeout(() => {
        fetchPayments();
      }, 2000);
    } else {
      fetchPayments(); // Immediate for other filters
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

      <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row">
        <input
          type="text"
          placeholder="Search..."
          value={filters.searchTerm}
          onChange={handleChange("searchTerm")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg md:w-1/3"
        />

        <select
          value={filters.paymentMethod}
          onChange={handleChange("paymentMethod")}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        >
          <option value="">All</option>
          <option value="UPI">UPI</option>
          <option value="Cash">Cash</option>
        </select>

        <input
          type="date"
          value={filters.fromDate}
          onChange={handleChange("fromDate")}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        />

        <input
          type="date"
          value={filters.toDate}
          onChange={handleChange("toDate")}
          disabled={!filters.fromDate}
           min={filters.fromDate || undefined}
             
              className="py-2 text-sm text-gray-900 border border-gray-300 rounded-lg x-3 peer disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

      </div>

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
