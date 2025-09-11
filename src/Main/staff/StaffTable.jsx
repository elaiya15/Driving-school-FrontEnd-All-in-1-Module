import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers.jsx";



// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>
);
const StaffTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthState } = useRole();
const [errorMsg, setErrorMsg] = useState("");
const [error, setError] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

  const controllerRef = useRef(null);
  const debounceRef = useRef(null);
  const isPasteRef = useRef(false);

  const updateURLParams = ({ search, gender, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      search ? params.set("search", search) : params.delete("search");
    }
    if (gender !== undefined) {
      gender ? params.set("gender", gender) : params.delete("gender");
    }
    if (page !== undefined) {
      page && page > 1 ? params.set("page", page) : params.set("page", "1");
    }
    params.set("limit", limit);

    navigate({ search: params.toString() }, { replace: true });
  };

  // Set state from URL once on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genderFromURL = params.get("gender") || "";
    const searchFromURL = params.get("search") || "";
    const pageFromURL = parseInt(params.get("page")) || 1;

    const shouldUpdate =
      !params.has("limit") ||
      searchQuery !== searchFromURL ||
      selectedGender !== genderFromURL ||
      currentPage !== pageFromURL;

    setSelectedGender(genderFromURL);
    setSearchQuery(searchFromURL);
    setCurrentPage(pageFromURL);

    if (shouldUpdate) {
      updateURLParams({
        search: searchFromURL,
        gender: genderFromURL,
        page: pageFromURL,
      });
    }
  }, []);

  // Fetch staff data
  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (searchQuery.trim()) params.search = searchQuery;
        if (selectedGender) params.gender = selectedGender;
        if (currentPage) params.page = currentPage;
        if (limit) params.limit = limit;

        const response = await axios.get(`${URL}/api/v2/staff`, {
         ...branchHeaders(),
          params,
          signal: controller.signal,
        });

        setStaff(response.data.staffList || []);
        setCurrentPage(response.data.currentPage || 1);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data?.message ===
                "Credential Invalid or Expired Please Login Again")
          ) {
            setErrorMsg("Credential Invalid or Expired Please Login Again");
            return setTimeout(() => {
              clearAuthState();
              setErrorMsg("")
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
      } finally {
        setLoading(false);
      }
    };

    // Debounce fetch unless it's a paste
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isPasteRef.current) {
      fetchData(); // immediate fetch on paste
      isPasteRef.current = false;
    } else {
      debounceRef.current = setTimeout(() => {
        fetchData();
      }, 1500); // debounced fetch
    }

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedGender, currentPage]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    updateURLParams({ search: value, gender: selectedGender, page: 1 });
  };

  const handlePaste = () => {
    isPasteRef.current = true; // flag paste event to bypass debounce
  };

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setSelectedGender(value);
    setCurrentPage(1);
    updateURLParams({ search: searchQuery, gender: value, page: 1 });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= TotalPages) {
      setCurrentPage(page);
      updateURLParams({ search: searchQuery, gender: selectedGender, page });
    }
  };

  return (
    <div className="p-4">
        {errorMsg && <Toast message={errorMsg} />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">Staff Details</h3>
        <button
          onClick={() => navigate("/admin/staff/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Register
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
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
            type="search"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 pl-10 py-2"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            onPaste={handlePaste}
          />
        </div>

        <div className="relative w-full sm:w-36 md:w-1/4 lg:w-1/6">
          <select
            id="floating_gender"
            className="peer block w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 px-3 py-2"
            value={selectedGender}
            onChange={handleGenderChange}
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
          <label
            htmlFor="floating_gender"
            className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
              selectedGender ? "text-blue-600" : ""
            }`}
          >
            Gender
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-blue-600 font-semibold text-lg">
          Loading...
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-sm text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Mobile No</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.length > 0 ? (
                  staff.map((instructor, index) => (
                    <tr key={instructor._id} className="bg-white border-b">
                      <th className="px-6 py-4 font-medium text-gray-900">
                        {(currentPage - 1) * limit + index + 1}
                      </th>
                      <td className="px-2 py-4">
                        <img
                          src={`${URL}/api/image-proxy/${extractDriveFileId(
                            instructor.photo
                          )}?t=${Date.now()}`}
                          alt={`${instructor.fullName}'s profile`}
                          className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-md"
                        />
                      </td>
                      <td className="px-6 py-4">{instructor.fullName}</td>
                      <td className="px-6 py-4">{instructor.gender}</td>
                      <td className="px-6 py-4">{instructor.mobileNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() =>
                              navigate(`/admin/staff/${instructor._id}/view`)
                            }
                            className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                          >
                            <i className="fa-solid fa-eye text-blue-600"></i>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/staff/${instructor._id}/edit`)
                            }
                            className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                          >
                            <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-red-600">
                      Staff not found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {staff.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={TotalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StaffTable;
