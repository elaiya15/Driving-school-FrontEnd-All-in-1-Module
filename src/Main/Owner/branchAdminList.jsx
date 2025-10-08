import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers";

const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
    {message}
  </div>
);

const AdminTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthState } = useRole();

  const [errorMsg, setErrorMsg] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // ✅ keep fixed but still send to backend

  const [searchQuery, setSearchQuery] = useState("");
  const controllerRef = useRef(null);
  const debounceRef = useRef(null);

  // ✅ Update URL params
  const updateURLParams = ({ search, page }) => {
    const params = new URLSearchParams(location.search);
    if (search !== undefined) {
      search ? params.set("search", search) : params.delete("search");
    }
    if (page !== undefined) {
      page && page > 1 ? params.set("page", page) : params.set("page", "1");
    }
    params.set("limit", limit);
    navigate({ search: params.toString() }, { replace: true });
  };

  // ✅ Initialize from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);

    if (!params.has("limit")) {
      updateURLParams({
        search: params.get("search") || "",
        page: parseInt(params.get("page")) || 1,
      });
    }
  }, []);

  // ✅ Fetch Admins
  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const params = {};
        if (searchQuery.trim()) params.search = searchQuery;
        if (currentPage) params.page = currentPage;
        params.limit = limit;

        const response = await axios.get(`${URL}/api/v1/admins`, {
          ...branchHeaders(),
          params,
          signal: controller.signal,
        });

        setAdmins(response.data.data || []);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching admins:", error);

           // ✅ 401 handling
           if (error.response?.status === 401|| error.response?.status === 403) {
          setErrorMsg(error.response?.data?.message||error.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            setErrorMsg("");
          }, 2000);
        }

          const errorData = error?.response?.data;
          const errors =
            errorData?.errors || errorData?.message || "";
          setErrorMsg(Array.isArray(errors) ? errors.join(", ") : errors);

          setTimeout(() => setErrorMsg(""), 4000);
        }
      } finally {
        setLoading(false);
      }
    };

    // ✅ debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchData, 800);

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, currentPage]);

  // ✅ update URL whenever search/page changes
  useEffect(() => {
    updateURLParams({ search: searchQuery, page: currentPage });
  }, [searchQuery, currentPage]);

  return (
    <div className="p-4">
      {errorMsg && <Toast message={errorMsg} />}

      {/* Header */}
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">
          Admin Details
        </h3>
        <button
          onClick={() => navigate("/owner/add-admin")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Register Admin
        </button>
      </div>

      {/* Search Box */}
      <div className="w-full mb-4 lg:w-1/3">
        <div className="relative">
          <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
            <i className="text-gray-500 fas fa-search"></i>
          </div>
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setCurrentPage(1); // reset to page 1 on search
              setSearchQuery(e.target.value);
            }}
            className="w-full py-2 pl-10 pr-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">
          Loading...
        </div>
      ) : (
        <div className="relative mt-2 overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-sm text-gray-700 bg-gray-50">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Mobile No</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((admin, index) => (
                  <tr key={admin._id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="px-2 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(
                          admin.photo
                        )}?t=${Date.now()}`}
                        alt={admin.fullName}
                        className="object-cover w-16 h-16 border-2 border-white rounded-full shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">{admin.fullName}</td>
                    <td className="px-6 py-4">{admin.gender}</td>
                    <td className="px-6 py-4">{admin.mobileNumber}</td>
                    <td className="px-6 py-4">
                      {admin.branchId?.branchName || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/owner/branch-admin/${admin.branchId?._id || "unassigned"}/${admin._id}/view`
                            )
                          }
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <i className="text-blue-600 fa-solid fa-eye"></i>
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/owner/branch-admin/${admin.branchId?._id || "unassigned"}/${admin._id}/edit`
                            )
                          }
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <i className="text-blue-600 fa-solid fa-pen-to-square"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-8 font-medium text-center text-red-600"
                  >
                    No Admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {admins.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default AdminTable;
