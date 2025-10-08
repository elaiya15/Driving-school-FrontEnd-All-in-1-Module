import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers.jsx";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import Pagination from "../../Components/Pagination";

const categoryOptions = [
  "Electronics",
  "Maintenance",
  "Water",
  "Electricity",
  "Rent",
  "Salary",
  "Stationery",
  "Fuel",
  "Others",
];

const BranchExpenses = () => {
  const { clearAuthState } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    billCopy: null,
  });

  const itemsPerPage = 10;
  const branchId = branchHeaders().headers["x-branch-id"];
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // ---- URL helper
  const updateURL = (params) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (params.fromDate) query.set("from", params.fromDate);
    if (params.toDate) query.set("to", params.toDate);
    query.set("page", params.page);
    query.set("limit", itemsPerPage);
    navigate({ search: query.toString() }, { replace: true });
  };

  // ---- Fetch expenses with overrides to avoid stale state
  const fetchExpenses = useCallback(
    async ({ signal, search: s, category: c, fromDate: f, toDate: t, page: p } = {}) => {
      try {
        setLoading(true);

        // Don't fetch if only fromDate is selected
        const finalFrom = f !== undefined ? f : fromDate;
        const finalTo = t !== undefined ? t : toDate;
        if (finalFrom && !finalTo) {
          setLoading(false);
          return;
        }

        const qs = new URLSearchParams();
        const finalSearch = s !== undefined ? s : search;
        const finalCategory = c !== undefined ? c : categoryFilter;
        const finalPage = p !== undefined ? p : currentPage;

        if (finalSearch) qs.set("search", finalSearch);
        if (finalCategory) qs.set("category", finalCategory);
        if (finalFrom && finalTo) {
          qs.set("from", finalFrom);
          qs.set("to", finalTo);
        }
        qs.set("page", finalPage);
        qs.set("limit", itemsPerPage);

        const res = await axios.get(
          `${URL}/api/v1/expenses/branch/${branchId}?${qs}`,
          { ...branchHeaders(), signal }
        );

        setExpenses(res.data.expenses || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        if (axios.isCancel(err)) return;
         // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
          setError(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            setError("");
          }, 2000);
        
        } else {
          setError(err.response?.data?.message || "Failed to fetch expenses");
        }
      } finally {
        setLoading(false);
      }
    },
    [search, categoryFilter, fromDate, toDate, currentPage, branchId, clearAuthState, navigate]
  );

  // ---- Debounced search only
 useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  const controller = new AbortController();
  abortRef.current = controller;

  debounceRef.current = setTimeout(() => {
    fetchExpenses({ signal: controller.signal, search });
  }, 1500);

  return () => clearTimeout(debounceRef.current);
}, [search]);
  // ---- Instant triggers for other filters
  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
    updateURL({ search, category: value, fromDate, toDate, page: 1 });

    fetchExpenses({
      signal: new AbortController().signal,
      category: value,
      search,
      fromDate,
      toDate,
      page: 1,
    });
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    if (toDate && new Date(toDate) < new Date(value)) setToDate("");
    setCurrentPage(1);

    updateURL({ search, category: categoryFilter, fromDate: value, toDate, page: 1 });

    fetchExpenses({
      signal: new AbortController().signal,
      search,
      category: categoryFilter,
      fromDate: value,
      toDate,
      page: 1,
    });
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(1);

    updateURL({ search, category: categoryFilter, fromDate, toDate: value, page: 1 });

    fetchExpenses({
      signal: new AbortController().signal,
      search,
      category: categoryFilter,
      fromDate,
      toDate: value,
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    updateURL({ search: "", category: categoryFilter, fromDate, toDate, page: 1 });

    fetchExpenses({
      signal: new AbortController().signal,
      search: "",
      category: categoryFilter,
      fromDate,
      toDate,
      page: 1,
    });
  };

  // ---- Load URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setCategoryFilter(params.get("category") || "");
    setFromDate(params.get("from") || "");
    setToDate(params.get("to") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);
  }, [location.search]);

  // ---- Error auto-clear
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // ---- Pagination handler
  const handlePageChange = (p) => {
    setCurrentPage(p);
    updateURL({ search, category: categoryFilter, fromDate, toDate, page: p });

    fetchExpenses({
      signal: new AbortController().signal,
      search,
      category: categoryFilter,
      fromDate,
      toDate,
      page: p,
    });
  };

  // ---- Modal
  const openModal = (exp = null) => {
    setEditingExpense(exp);
    setFormData({
      category: exp?.category || "",
      description: exp?.description || "",
      amount: exp?.amount || "",
      billCopy: null,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("amount", formData.amount);
      if (formData.billCopy) fd.append("billCopy", formData.billCopy);

      if (editingExpense) {
        await axios.put(`${URL}/api/v1/expenses/${editingExpense._id}`, fd, branchHeaders());
      } else {
        await axios.post(`${URL}/api/v1/expenses`, fd, branchHeaders());
      }

      setModalOpen(false);
      setEditingExpense(null);
      setFormData({ category: "", description: "", amount: "", billCopy: null });
      setCurrentPage(1);

      updateURL({ search, category: categoryFilter, fromDate, toDate, page: 1 });

      fetchExpenses({
        signal: new AbortController().signal,
        search,
        category: categoryFilter,
        fromDate,
        toDate,
        page: 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:justify-between">
        <h2 className="text-xl font-bold">Branch Expenses</h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {/* Search + Clear */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPaste={(e) => {
              const text = e.clipboardData?.getData("text") || "";
              e.preventDefault();
              setSearch(text);
              fetchExpenses({
                signal: new AbortController().signal,
                search: text,
                category: categoryFilter,
                fromDate,
                toDate,
                page: 1,
              });
            }}
            placeholder="Search category/description"
            className="w-full px-3 py-2 border rounded pr-8"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-64"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* Date Range */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => handleFromDateChange(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => handleToDateChange(e.target.value)}
          className="px-3 py-2 border rounded"
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-5 text-blue-600">Loading...</div>
      ) : (
        <div className="overflow-x-auto shadow rounded">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Amount (₹)</th>
                <th className="px-4 py-2">Bill</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((e, idx) => (
                  <tr key={e._id} className="bg-white border-b">
                    <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-2">{e.category}</td>
                    <td className="px-4 py-2">{e.description}</td>
                    <td className="px-4 py-2">{e.amount}</td>
                    <td className="px-4 py-2">
                      {e.billCopy ? (
                        <a
                          href={`${URL}/api/image-proxy/${extractDriveFileId(e.billCopy)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2">{moment(e.createdAt).format("DD-MM-YYYY")}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => openModal(e)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <i className="text-blue-600 fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-red-600">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {expenses.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-full max-w-md p-6 bg-white rounded shadow">
            <h3 className="mb-4 text-lg font-bold">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h3>
            <div className="space-y-3">
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Category</option>
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) =>
                  setFormData({ ...formData, billCopy: e.target.files[0] })
                }
                className="w-full"
              />
            </div>
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchExpenses;
