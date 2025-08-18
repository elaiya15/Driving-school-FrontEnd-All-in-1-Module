import { useEffect, useState } from "react";
import { URL } from "../../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext";

const MarkStaff = () => {
   const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffData, setSelectedStaffData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const [date, setDate] = useState("");
  const [statuses] = useState(["Present", "Absent"]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`${URL}/api/staff`, {
                     withCredentials: true,
        });
        setStaffList(res.data.staffList);
      }catch (err) {
         if (!axios.isCancel(err)) {
            // setError(err.response.data.message);
        if (err.response &&(err.response.status === 401 ||err.response.data.message === "Invalid token")) {
            setTimeout(() => {
              clearAuthState();
              // navigate("/");
            }, 3000);
          }
        }
      }
    };

    fetchStaff();
  }, []);

  const filteredStaff = Array.isArray(staffList)
    ? staffList.filter((s) =>
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleStaffChange = (id) => {
    const selected = staffList.find((s) => s._id === id);
    setSelectedStaff(selected);
    setSelectedStaffData(selected);
    setIsOpen(false);
    setErrors((prev) => ({ ...prev, selectedStaff: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!selectedStaff) newErrors.selectedStaff = "Please select a staff.";
    if (!date) newErrors.date = "Please select a date.";
    if (!checkIn) newErrors.checkIn = "Please enter check-in time.";
    if (!checkOut) newErrors.checkOut = "Please enter check-out time.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
     
      const checkInDateTime = `${date}T${checkIn}:00.000Z`;
      const checkOutDateTime = `${date}T${checkOut}:00.000Z`;

      const payload = {
        staff: selectedStaff._id,
        date,
        checkIn: checkInDateTime,
        status: selectedStatus,
        checkOut: checkOutDateTime,
      };

      await axios.post(`${URL}/api/admin/staff-attendance`, payload, {
                   withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      console.error("Error submitting data:", error);
      if (error.response && error.response.status === 401) {
        clearAuthState()
        // navigate("/");
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
        Mark Attendance
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-3/4 flex flex-col gap-4">
            <div className="relative w-full">
              <label
                htmlFor="staff"
                className={`
                    absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
                    ${
                      selectedStaff || isOpen
                        ? "text-xs -top-2.5 text-blue-600"
                        : "top-3 text-sm text-gray-500"
                    }
                  `}
              >
                Select a Staff
              </label>

              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="peer h-[52px] w-full text-left px-3 pt-4 pb-1.5 text-sm bg-transparent border border-gray-300 rounded-lg text-gray-900 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
              >
                <span className={`${selectedStaff ? "" : "text-gray-500"}`}>
                  {selectedStaff?.fullName}
                </span>
              </button>

              {isOpen && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 shadow-lg rounded-md overflow-hidden z-50">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full p-3 text-sm border-b border-gray-200 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredStaff.length > 0 ? (
                      filteredStaff.map((staff) => (
                        <button
                          key={staff._id}
                          type="button"
                          onClick={() => handleStaffChange(staff._id)}
                          className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100"
                        >
                          {staff.fullName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {selectedStaffData && (
              <div className="block lg:hidden w-full border p-4 rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      selectedStaffData.photo
                    )}`}
                    alt={selectedStaffData.fullName}
                    className="w-14 h-14 rounded-full border"
                  />
                  <p className="text-base font-semibold">
                    {selectedStaffData.fullName}
                  </p>
                </div>
              </div>
            )}
            <div className="relative w-full">
              <input
                type="date"
                id="date"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onFocus={(event) =>
                  (event.nativeEvent.target.defaultValue = "")
                }
                className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                placeholder=" "
              />
              <label
                htmlFor="date"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
              >
                Date
              </label>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative w-full">
                <input
                  type="time"
                  id="checkIn"
                  name="checkIn"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="checkIn"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Check-In Time
                </label>
                {errors.checkIn && (
                  <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>
                )}
              </div>

              <div className="relative w-full">
                <input
                  type="time"
                  id="checkOut"
                  name="checkOut"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="checkOut"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Check-Out Time
                </label>
                {errors.checkOut && (
                  <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-2">Status</label>
                <div className="flex flex-col gap-3">
                  {statuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={selectedStatus === status}
                        onChange={() => setSelectedStatus(status)}
                        className="w-3 h-3"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-full lg:w-1/4">
            {selectedStaffData && (
              <div className="w-full border p-4 rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      selectedStaffData.photo
                    )}`}
                    alt={selectedStaffData.fullName}
                    className="w-16 h-16 rounded-full border"
                  />
                  <p className="text-xl font-semibold">
                    {selectedStaffData.fullName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md">
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-700 bg-green-100 rounded-md dark:bg-green-800 dark:text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </div>
          <div className="ms-3 text-sm font-normal">
            Attendance marked successfully
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkStaff;
