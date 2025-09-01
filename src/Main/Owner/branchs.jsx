import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Pagination from "../../Components/Pagination";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { URL } from "../../App";
import {
  setBranchSession,
  removeBranchSession,
} from "./../../Components/utils/BranchCookie.jsx";
import AssignAdmin from "./AssignAdmin"; // ✅ Import new component
const BranchTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthState, user } = useRole();
const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [adminModeBranch, setAdminModeBranch] = useState(null); // ✅ which branch is admin mode ON
  const limit = 10;

  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const debounceRef = useRef(null);
  const lastSearchValue = useRef("");

  const updateURLParams = (updates) => {
    const updated = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value == null) {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });
    navigate({ search: updated.toString() }, { replace: true });
  };
//old
//   useEffect(() => {
//     const controller = new AbortController();
//     const trimmedSearch = searchTerm.trim();

//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const params = {
//           page: currentPage,
//           limit,
//           ...(trimmedSearch && { search: trimmedSearch }),
//         };

//         if (!user || !user.organizationId) {
//           throw new Error("User or organization ID is not available");
//         }

//         const res = await axios.get(
//           `${URL}/api/v1/branches/organization_branches/${user.organizationId}`,
//           {
//             params,
//             withCredentials: true,
//             signal: controller.signal,
//           }
//         );
//         setBranches(res.data || []); // ✅ make sure it's an array
//         setTotalPages(res.data.totalPages || 1);
//       } catch (err) {
//         if (!axios.isCancel(err)) {
//           setError(err?.response?.data?.message || err.message);
//           setTimeout(() => setError(null), 4000);

//           if (
//             err.response &&
//             (err.response.status === 401 ||
//               err.response.data.message ===
//                 "Credential Invalid or Expired Please Login Again")
//           ) {
//             setTimeout(() => clearAuthState(), 2000);
//           }
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     const prevSearch = lastSearchValue.current;
//     const isSearchChanged = trimmedSearch !== prevSearch;
//     const isPaste =
//       isSearchChanged && trimmedSearch.length - prevSearch.length > 1;

//     lastSearchValue.current = trimmedSearch;

//     if (debounceRef.current) clearTimeout(debounceRef.current);

//     if (isSearchChanged) {
//       if (isPaste || !trimmedSearch) {
//         fetchData();
//       } else {
//         debounceRef.current = setTimeout(fetchData, 1500);
//       }
//     } else {
//       fetchData();
//     }

//     return () => {
//       controller.abort();
//       if (debounceRef.current) clearTimeout(debounceRef.current);
//     };
//   }, [searchTerm, currentPage]);

// 🔹 define fetchData outside useEffect so it can be reused
const fetchData = async (controllerSignal) => {
  setLoading(true);
  setError(null);

  try {
    const params = {
      page: currentPage,
      limit,
      ...(searchTerm.trim() && { search: searchTerm.trim() }),
    };

    if (!user || !user.organizationId) {
      throw new Error("User or organization ID is not available");
    }

    const res = await axios.get(
      `${URL}/api/v1/branches/organization_branches/${user.organizationId}`,
      {
        params,
        withCredentials: true,
        signal: controllerSignal,
      }
    );

    setBranches(res.data || []);
    setTotalPages(res.data.totalPages || 1);
  } catch (err) {
    if (!axios.isCancel(err)) {
      setError(err?.response?.data?.message || err.message);
      setTimeout(() => setError(null), 4000);

      if (
        err.response &&
        (err.response.status === 401 ||
          err.response.data.message ===
            "Credential Invalid or Expired Please Login Again")
      ) {
        setTimeout(() => clearAuthState(), 2000);
      }
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const controller = new AbortController();

  const prevSearch = lastSearchValue.current;
  const isSearchChanged = searchTerm.trim() !== prevSearch;
  const isPaste =
    isSearchChanged && searchTerm.trim().length - prevSearch.length > 1;

  lastSearchValue.current = searchTerm.trim();

  if (debounceRef.current) clearTimeout(debounceRef.current);

  if (isSearchChanged) {
    if (isPaste || !searchTerm.trim()) {
      fetchData(controller.signal);
    } else {
      debounceRef.current = setTimeout(
        () => fetchData(controller.signal),
        1500
      );
    }
  } else {
    fetchData(controller.signal);
  }

  return () => {
    controller.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, [searchTerm, currentPage]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    updateURLParams({ search: val, page: 1 });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateURLParams({ page });
    }
  };

  const handleAdminModeToggle = (branchId) => {
console.log('branchId:', branchId)

   console.log('adminModeBranch:', adminModeBranch);
    if (adminModeBranch === branchId) {
      // ✅ turn OFF admin mode
      removeBranchSession();
      setAdminModeBranch(null);
       navigate("/owner/dashboard", { replace: true }); // no forward to admin
    } else {
      // ✅ turn ON admin mode for this branch
      setBranchSession(branchId);
      setAdminModeBranch(branchId);
       setTimeout(() => {
      navigate("/admin/dashboard", { replace: true });
    }, 850);
    // navigate("/admin/dashboard", { replace: true }); // Redirect to admin dashboard on enabling admin mode and  no back to owner
      
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">
          Branch List
        </h3>
        <button
          onClick={() => navigate("/owner/branches/create")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          + Add Branch
        </button>
      </div>

      <div className="w-full mb-4 lg:w-1/3">
        <div className="relative">
          <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
            <svg
              className="w-4 h-4 mr-2 text-gray-500"
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
            placeholder="Search branch..."
            className="w-full py-2 pl-10 pr-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {error && (
        <div className="p-2 mb-4 text-sm text-white bg-red-500 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">
          Loading...
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-sm text-center text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Branch Name</th>
                  <th className="px-6 py-4">Total Learners</th>
                  <th className="px-6 py-4">Total Instructors</th>
                  <th className="px-6 py-4">Branch Admin</th>
                    <th className="px-6 py-4">Assign Admin</th> 
                  <th className="px-6 py-4">Switch Admin Mode</th>
                </tr>
              </thead>
              <tbody>
  {branches.length > 0 ? (
    branches.map((branch, index) => (
      <tr key={branch._id} className="text-center bg-white border-b">
        <td className="px-6 py-4">{index + 1 + (currentPage - 1) * limit}</td>
        <td className="px-6 py-4">{branch.branchName}</td>
        <td className="px-6 py-4">{branch.totalLearners || 0}</td>
        <td className="px-6 py-4">{branch.totalInstructors || 0}</td>
        <td className="px-6 py-4">
          {branch.branchAdmins && branch.branchAdmins.length > 0
            ? branch.branchAdmins.map((admin) => admin.fullName).join(", ")
            : "N/A"}
        </td>

        {/* ✅ New Assign/Re-Assign button */}
        <td className="px-0 py-4">
          <button
            onClick={() => setSelectedBranch(branch)}
            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            {branch.branchAdmins && branch.branchAdmins.length > 0
              ? "Re-Assign"
              : "Assign"}
          </button>
        </td>

        <td className="px-6 py-4">
          <button
            onClick={() => handleAdminModeToggle(branch._id)}
            className="text-2xl focus:outline-none"
          >
            {adminModeBranch === branch._id ? (
              <i className="text-3xl text-blue-600 fa-solid fa-toggle-on"></i>
            ) : (
              <i className="text-3xl text-gray-400 fa-solid fa-toggle-off"></i>
            )}
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="py-4 text-center text-red-600">
        No branches found
      </td>
    </tr>
  )}
</tbody>

{/* ✅ Modal Render */}
{selectedBranch && (
  <AssignAdmin
    branch={selectedBranch}
    onClose={(success) => {
      setSelectedBranch(null);
      if (success) {
        // refresh branch list after assigning
      
        fetchData(); // ✅ refresh branch list via API
      }
    }}
  />
)}
              {/* <tbody>
                {branches.length > 0 ? (
                  branches.map((branch, index) => (
                    <tr key={branch._id} className="text-center bg-white border-b">
                      <td className="px-6 py-4">
                        {index + 1 + (currentPage - 1) * limit}
                      </td>
                      <td className="px-6 py-4">{branch.branchName}</td>
                      <td className="px-6 py-4">
                        {branch.totalLearners || 0}
                      </td>
                      <td className="px-6 py-4">
                        {branch.totalInstructors || 0}
                      </td>
                      <td className="px-6 py-4">
                        {branch.branchAdmins && branch.branchAdmins.length > 0
                          ? branch.branchAdmins
                              .map((admin) => admin.fullName)
                              .join(", ")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleAdminModeToggle(branch._id)}
                          className="text-2xl focus:outline-none"
                        >
                          {adminModeBranch === branch._id ? (
                            <i className="text-3xl text-blue-600 fa-solid fa-toggle-on"></i>
                          ) : (
                            <i className="text-3xl text-gray-400 fa-solid fa-toggle-off"></i>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-4 text-center text-red-600"
                    >
                      No branches found
                    </td>
                  </tr>
                )}
              </tbody> */}
            </table>
          </div>

          {branches.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BranchTable;
