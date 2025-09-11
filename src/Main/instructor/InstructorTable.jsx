import { useState, useEffect,useRef } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust 
import branchHeaders from "../../Components/utils/headers.jsx";

// path as needed
// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
  {message}
  </div>
);
const InstructorTable = () => {
 const isPastedRef = useRef(false);

  const {role, user,setUser,setRole,clearAuthState} =  useRole();

   const navigate = useNavigate();
  const location = useLocation();
const [errorMsg, setErrorMsg] = useState("");
  const [error, setError] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(10);
  const [TotalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const controllerRef = useRef(null);

  // Ensure default page and limit in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let shouldUpdate = false;

    if (!params.get("page")) {
      params.set("page", "1");
      shouldUpdate = true;
    }

    if (!params.get("limit")) {
      params.set("limit", limit.toString());
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search, limit, navigate]);

  const updateURLParams = ({ search, gender, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      if (search) params.set("search", search);
      else params.delete("search");
    }

    if (gender !== undefined) {
      if (gender) params.set("gender", gender);
      else params.delete("gender");
    }

    if (page !== undefined) {
      if (page) params.set("page", page);
      else params.delete("page");
    }

    params.set("limit", limit);

    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const genderFromURL = params.get("gender") || "";
    const pageFromURL = parseInt(params.get("page")) || 1;

    setSearchQuery(searchFromURL);
    setSelectedGender(genderFromURL);
    setCurrentPage(pageFromURL);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${URL}/api/v2/instructor`, {
          ...branchHeaders(),
            params: {
            search: searchFromURL,
            gender: genderFromURL,
            page: pageFromURL,
            limit,
          },
          signal: controller.signal,
        });

        setInstructors(response.data.instructorsWithDecrypted);
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
          const errors = errorData?.errors || errorData?.message ;


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
      }finally {
        setLoading(false);
      }
    };

   const debounce = setTimeout(() => {
  fetchData();
  isPastedRef.current = false; // reset paste flag
}, searchFromURL && !isPastedRef.current ? 1500 : 0);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [location.search]);

  const handleSearchChange = (e) => {
    updateURLParams({
      search: e.target.value,
      gender: selectedGender,
      page: 1,
    });
  };

  const handleGenderChange = (e) => {
    updateURLParams({
      search: searchQuery,
      gender: e.target.value,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= TotalPages) {
      updateURLParams({
        search: searchQuery,
        gender: selectedGender,
        page,
      });
    }
  };


  return (
    <div className="p-4">
        {errorMsg && <Toast message={errorMsg} />}

      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">
          Instructor Details
        </h3>
        <button
          onClick={() => navigate("/admin/instructor/new")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Register
        </button>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 mb-4 md:flex-row">
        <div className="relative w-full md:w-1/3">
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
            type="search"
            className="w-full py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            onPaste={() => {
            isPastedRef.current = true;
           }}
          />
        </div>

        <div className="relative w-full sm:w-36 md:w-1/4 lg:w-1/6">
          <select
            id="floating_gender"
            className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg appearance-none peer focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
        <div className="py-5 text-lg font-semibold text-center text-blue-600">
          Loading...
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-sm text-gray-700 bg-gray-50">
                <tr className="">
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Mobile No</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors && instructors.length > 0 ? (
                  instructors.map((instructor, index) => (
                    <tr key={instructor._id} className="bg-white border-b">
                      <th className="px-6 py-4 font-medium text-gray-900">
                        {index + 1}
                      </th>
                      <td className="px-2 py-4">
                        <img
                          src={`${URL}/api/image-proxy/${extractDriveFileId(
                            instructor.photo
                          )}?t=${Date.now()}`}
                          alt={`${instructor.fullName}'s profile`}
                          
                          className="object-cover w-16 h-16 border rounded-full shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4">{instructor.fullName}</td>
                      <td className="px-6 py-4">{instructor.gender}</td>
                      <td className="px-6 py-4">{instructor.mobileNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/instructor/${instructor._id}/view`
                              )
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            <i className="text-blue-600 fa-solid fa-eye"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/instructor/${instructor._id}/edit`
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
                    <td colSpan="6" className="py-8 text-center text-red-600">
                      Instructor not found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {instructors && instructors.length > 0 && (
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

export default InstructorTable;
