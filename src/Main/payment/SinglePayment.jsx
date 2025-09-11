import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import moment from "moment";
import { FaSyncAlt } from "react-icons/fa";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers";
const SinglePayment = () => {
  const navigate = useNavigate();
  const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const { id } = useParams();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(1);
  const limit = 5;

  useEffect(() => {
    const controller = new AbortController();

    const fetchPayments = async () => {
      setLoading(true);
      try {
        // const token = localStorage.getItem("token");

        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
          console.error(
            "Invalid date range. 'From Date' cannot be greater than 'To Date'."
          );
          return;
        }

        const formatDate = (date) =>
          date ? new Date(date).toISOString().split("T")[0] : "";

        const queryParams = new URLSearchParams({
          page: currentPage,
          limit,
          search: searchTerm,
          paymentMethod,
          fromdate: formatDate(fromDate),
          todate: formatDate(toDate),
        });

        const response = await axios.get(
          `${URL}/api/v2/payments/${id}?${queryParams}`,
          {
           ...branchHeaders(), 
            signal: controller.signal,
          }
        );

        setPayments(response.data.payments || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching data:", error);
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

    if (searchTerm.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchPayments();
      }, 2000);

      return () => {
        clearTimeout(debounceTimer);
        controller.abort();
      };
    } else {
      fetchPayments();
      return () => controller.abort();
    }
  }, [searchTerm, paymentMethod, fromDate, toDate, currentPage, id]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleRefresh = () => {
    setSearchTerm("");
    setPaymentMethod("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <h3 className="text-base font-semibold">Payment  History</h3>
        <FaSyncAlt
          className="text-blue-500 cursor-pointer hover:text-blue-600"
          onClick={handleRefresh}
          size={20}
          aria-label="Refresh Tests"
        />
      </div>

      <div className="flex flex-col justify-between mb-4 space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
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
            className="w-full py-2 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              className="absolute inset-y-0 flex items-center right-3"
              onClick={() => setSearchTerm("")}
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

        <div className="flex flex-col justify-end w-full gap-4 md:flex-row md:items-center md:w-auto">
          <div className="relative w-full sm:w-36">
            <select
              id="floating_payment"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-0 focus:border-blue-600"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">All</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
            <label
              htmlFor="floating_payment"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${paymentMethod ? "text-blue-600" : ""}`}
            >
              Payment
            </label>{" "}
          </div>
          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
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
              className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
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
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-sm text-left text-gray-700 bg-gray-50">
              <tr className="">
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount ₹</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-6 text-center text-red-600 bg-white"
                  >
                    Payments not found
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment._id} className="bg-white border-b">
                    <th className="px-6 py-4">
                      {(currentPage - 1) * limit + index + 1}
                    </th>
                    <td className="px-6 py-4">{payment.paymentMethod}</td>
                    <td className="px-6 py-4">{payment.amount}</td>
                    <td className="px-6 py-4">
                      {moment(payment.date).format("DD-MM-YYYY")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {payments.length > 0 && (
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

export default SinglePayment;
