import "@fortawesome/fontawesome-free/css/all.min.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";


// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>
);
const LearnerTable = () => {
 const isPastedRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
      const {role, user,setUser,setRole,clearAuthState} =  useRole();
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [learners, setLearners] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toDateWarning, setToDateWarning] = useState("");

  const debounceTimer = useRef(null);

  // ✅ Add default query params on first load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let needsUpdate = false;

    if (!params.has("page")) {
      params.set("page", "1");
      needsUpdate = true;
    }

    if (!params.has("limit")) {
      params.set("limit", limit.toString());
      needsUpdate = true;
    }

    if (params.has("search") && !params.get("search")) {
      params.delete("search");
      needsUpdate = true;
    }

    if (params.has("gender") && !params.get("gender")) {
      params.delete("gender");
      needsUpdate = true;
    }

    if (needsUpdate) {
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search]);

  const updateURLParams = ({ search, gender, fromdate, todate, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      search ? params.set("search", search) : params.delete("search");
    }
    if (gender !== undefined) {
      gender && gender !== "All" ? params.set("gender", gender) : params.delete("gender");
    }
    if (fromdate !== undefined) {
      fromdate ? params.set("fromdate", fromdate) : params.delete("fromdate");
    }
    if (todate !== undefined) {
      todate ? params.set("todate", todate) : params.delete("todate");
    }
    if (page !== undefined) {
      params.set("page", page);
    }
    if (limit !== undefined) {
      params.set("limit", limit);
    }

    navigate({ search: params.toString() }, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setSelectedGender(params.get("gender") || "");
    setFromDate(params.get("fromdate") || "");
    setToDate(params.get("todate") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);
  }, [location.search]);



    const controllerRef = useRef(null);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort(); // cancel previous
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          limit,
          page: currentPage,
        };

        if (search.trim()) params.search = search.trim();
        if (selectedGender) params.gender = selectedGender;

        const isFromValid = moment(fromDate, "YYYY-MM-DD", true).isValid();
        const isToValid = moment(toDate, "YYYY-MM-DD", true).isValid();

        if (isFromValid && isToValid) {
          params.fromdate = fromDate;
          params.todate = toDate;
        }

        const response = await axios.get(`${URL}/api/v3/learner`, {
          params,
          withCredentials: true,
          signal: controller.signal,
        });

        setLearners(response.data.learners || []);
        setTotalPages(response.data.totalPages || 1);
      }  catch (error) {
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

    const isFromValid = moment(fromDate, "YYYY-MM-DD", true).isValid();
    const isToValid = moment(toDate, "YYYY-MM-DD", true).isValid();
    const bothDatesSelected = isFromValid && isToValid;
    const bothDatesCleared = !fromDate && !toDate;

    const shouldCallAPI =
      search.trim() !== "" ||
      selectedGender !== "" ||
      bothDatesSelected ||
      bothDatesCleared;

    if (!shouldCallAPI) return;

    clearTimeout(debounceTimer.current);

    if (isPastedRef.current) {
      isPastedRef.current = false;
      fetchData(); // 👈 no debounce for paste
    } else {
      debounceTimer.current = setTimeout(fetchData, search ? 1500 : 0);
    }

    return () => {
      clearTimeout(debounceTimer.current);
      controller.abort();
    };
  }, [search, selectedGender, fromDate, toDate, currentPage]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    updateURLParams({ search: val, gender: selectedGender, fromdate: fromDate, todate: toDate, page: 1 });
    setCurrentPage(1);
  };

  const handleGenderChange = (e) => {
    const val = e.target.value;
    setSelectedGender(val);
    updateURLParams({ search, gender: val, fromdate: fromDate, todate: toDate, page: 1 });
    setCurrentPage(1);
  };

  const handleFromDateChange = (e) => {
    const val = e.target.value;
    setFromDate(val);

    if (val === "") setToDate("");

    if (toDateWarning) setToDateWarning("");

    updateURLParams({
      search,
      gender: selectedGender,
      fromdate: val,
      todate: val === "" ? "" : toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

 const handleToDateChange = (e) => {
  const val = e.target.value;

  // If user clears To Date, also clear From Date
  if (val === "") {
    setToDate("");
    setFromDate("");
    updateURLParams({ search, gender: selectedGender, fromdate: "", todate: "", page: 1 });
    setCurrentPage(1);
    return;
  }

  // Prevent selecting To Date without From Date
  if (!fromDate) {
    setToDateWarning("Please select From Date first.");
    return;
  }

  setToDateWarning("");
  setToDate(val);
  updateURLParams({ search, gender: selectedGender, fromdate: fromDate, todate: val, page: 1 });
  setCurrentPage(1);
};


  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    updateURLParams({ search, gender: selectedGender, fromdate: fromDate, todate: toDate, page });
  };

  return (
    <div className="p-4">
        {errorMsg && <Toast message={errorMsg} />}
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">Learner Details</h3>
        <button
          onClick={() => navigate("/admin/learner/new")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Register
        </button>
      </div>

     <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
  {/* Search Bar */}
  <div className="w-full lg:w-1/3">
    <div className="relative">
      <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
        <i className="text-gray-500 fas fa-search"></i>
      </div>
      <input
        type="search"
        placeholder="Search..."
        value={search}
        onChange={handleSearchChange}
        onPaste={() => {
          isPastedRef.current = true;
        }}
        className="w-full py-2 pl-10 pr-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  </div>

  {/* Filters: Gender, From, To */}
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-center lg:w-auto">
    {/* Gender Select */}
    <div className="relative w-full sm:w-40">
      <select
        value={selectedGender}
        onChange={handleGenderChange}
        className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg"
      >
        <option value="">All</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Others">Others</option>
      </select>
      <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">Gender</label>
    </div>

    {/* From Date */}
    <div className="relative w-full sm:w-40">
      <input
        type="date"
        value={fromDate}
        onChange={handleFromDateChange}
        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg"
      />
      <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">From</label>
    </div>

    {/* To Date */}
    <div className="relative w-full sm:w-40">
      <input
        type="date"
        value={toDate}
        onChange={handleToDateChange}
        min={fromDate || undefined}
        disabled={!fromDate}
        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">To</label>
      {toDateWarning && (
        <p className="mt-1 text-xs text-red-600">{toDateWarning}</p>
      )}
    </div>
  </div>
</div>


      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>
      ) : error ? (
        <div className="py-5 text-lg font-semibold text-center text-red-600">{error}</div>
      ) : (
        <>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-gray-700 bg-gray-50">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Mobile No</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {learners.length > 0 ? (
                learners.map((learner, index) => (
                  <tr key={learner._id} className="bg-white border-b">
                    <td className="py-4 sm:px-2">{(currentPage - 1) * limit + index + 1}</td>
                    <td className="py-4 sm:px-2">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(learner.photo)}?t=${Date.now()}`}
                        alt="Learner"
                        className="object-cover w-16 h-16 border-4 border-gray-100 rounded-full shadow-md"
                          // className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-md"

                      />
                    </td>
                    <td className="px-6 py-4">{learner.fullName}</td>
                    <td className="px-6 py-4">{learner.admissionNumber}</td>
                    <td className="px-6 py-4">{learner.gender}</td>
                    <td className="px-6 py-4">{learner.mobileNumber}</td>
                    <td className="px-6 py-4">{moment(learner.createdAt).format("DD-MM-YYYY")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/learner/${learner._id}/view`)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <i className="text-blue-600 fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/learner/${learner.admissionNumber}/${learner._id}/edit`)}
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
                  <td colSpan="8" className="py-10 text-center text-red-600">
                    Learner not found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


  {learners.length > 0 && (
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

export default LearnerTable;
