import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
  const branchId = branchHeaders().headers["x-branch-id"]; // branch header

  const updateURL = (params) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.fromDate) query.set("from", params.fromDate);
    if (params.toDate) query.set("to", params.toDate);
    query.set("page", params.page);
    query.set("limit", itemsPerPage);
    navigate({ search: query.toString() });
  };


  const fetchExpenses = async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        if (search) qs.set("search", search);
        if (fromDate && toDate) {
          qs.set("from", fromDate);
          qs.set("to", toDate);
        }
        qs.set("page", currentPage);
        qs.set("limit", itemsPerPage);

        const res = await axios.get(
          `${URL}/api/v1/expenses/branch/${branchId}?${qs}`,
          branchHeaders()
        );
        setExpenses(res.data.expenses || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
          // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
        //   setErrorMsg(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            // setErrorMsg("");
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
  // Fetch list
  useEffect(() => {
    const controller = new AbortController();
    
    fetchExpenses();
    return () => controller.abort();
  }, [search, fromDate, toDate, currentPage]);

  // Read URL params on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setFromDate(params.get("from") || "");
    setToDate(params.get("to") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);
  }, [location.search]);

  const handlePageChange = (p) => {
    setCurrentPage(p);
    updateURL({ search, fromDate, toDate, page: p });
  };

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
      const fd = new FormData();
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("amount", formData.amount);
      if (formData.billCopy) fd.append("billCopy", formData.billCopy);

      if (editingExpense) {
        await axios.put(
          `${URL}/api/v1/expenses/${editingExpense._id}`,
          fd,
          branchHeaders()
        );
      } else {
        await axios.post(`${URL}/api/v1/expenses`, fd, branchHeaders());
         fetchExpenses();
      }
      setModalOpen(false);
      setEditingExpense(null);
      setFormData({ category: "", description: "", amount: "", billCopy: null });
      setCurrentPage(1);
      updateURL({ search, fromDate, toDate, page: 1 });
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`${URL}/api/v1/expenses/${id}`, branchHeaders());
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
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
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
            updateURL({ search: e.target.value, fromDate, toDate, page: 1 });
          }}
          placeholder="Search category/description"
          className="px-3 py-2 border rounded w-full sm:w-64"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            updateURL({ search, fromDate: e.target.value, toDate, page: 1 });
          }}
          className="px-3 py-2 border rounded"
        />
        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => {
            setToDate(e.target.value);
            updateURL({ search, fromDate, toDate: e.target.value, page: 1 });
          }}
          className="px-3 py-2 border rounded"
        />
      </div>

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
                    <td className="px-4 py-2">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-2">{e.category}</td>
                    <td className="px-4 py-2">{e.description}</td>
                    <td className="px-4 py-2">{e.amount}</td>
                    <td className="px-4 py-2">
                      {e.billCopy ? (
                        <a
                          href={`${URL}/api/image-proxy/${extractDriveFileId(
                            e.billCopy
                          )}`}
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
                    <td className="px-4 py-2">
                      {moment(e.createdAt).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => openModal(e)}
                                                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"

                      >
                       <i className="text-blue-600 fa-solid fa-pen-to-square"></i>
                      </button>
                      {/* <button
                        onClick={() => handleDelete(e._id)}
                         className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                       <i className="text-red-600 fa-solid fa-trash"></i>

                      </button> */}
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
              {/* ✅ Category Dropdown */}
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
                required
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
                required
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
