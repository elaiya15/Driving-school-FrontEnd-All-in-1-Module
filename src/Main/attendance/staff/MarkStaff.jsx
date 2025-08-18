import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { URL } from "../../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext";

const validationSchema = yup.object().shape({
  selectedStaff: yup.string().required("Please select a staff."),
  date: yup.string().required("Please select a date."),
  checkIn: yup.string().required("Please enter check-in time."),
  checkOut: yup
    .string()
    .required("Please enter check-out time.")
    .test("is-after", "Check-out must be after check-in", function (value) {
      const { checkIn } = this.parent;
      return checkIn && value && checkIn < value;
    }),
  status: yup.string().required("Please select a status."),
});

const MarkStaff = () => {
  const { clearAuthState } = useRole();
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [selectedStaffData, setSelectedStaffData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      selectedStaff: "",
      date: "",
      checkIn: "",
      checkOut: "",
      status: "",
    },
  });

  const selectedStaff = watch("selectedStaff");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`${URL}/api/staff`, {
          withCredentials: true,
        });
        setStaffList(res.data.staffList);
      } catch (err) {
        if (
          err?.response?.status === 401 ||
          err?.response?.data?.message === "Invalid token"
        ) {
          setTimeout(() => {
            clearAuthState();
            navigate("/");
          }, 2000);
        }
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    const selected = staffList.find((s) => s._id === selectedStaff);
    setSelectedStaffData(selected || null);
  }, [selectedStaff, staffList]);

  const filteredStaff = staffList.filter((s) =>
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data) => {
    const payload = {
      staff: data.selectedStaff,
      date: data.date,
      checkIn: `${data.date}T${data.checkIn}:00.000Z`,
      checkOut: `${data.date}T${data.checkOut}:00.000Z`,
      status: data.status,
    };

    try {
      await axios.post(`${URL}/api/admin/staff-attendance`, payload, {
        withCredentials: true,
      });
      setToastOpen(true);
      reset();
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearAuthState();
        return;
      }

      const errorMsg = err?.response?.data?.errors || err?.message || "An error occurred";
      const messages = Array.isArray(errorMsg) ? errorMsg : [errorMsg];
      setErrorMessages(messages);
      setTimeout(() => setErrorMessages([]), 4000);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Mark Attendance</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col w-full gap-4 lg:w-3/4">
            {/* Mobile Image Preview */}
            {selectedStaffData && (
              <div className="block w-full p-4 border rounded-md lg:hidden">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(selectedStaffData.photo)}`}
                    alt={selectedStaffData.fullName}
                    className="border rounded-full w-14 h-14"
                  />
                  <p className="text-base font-semibold">{selectedStaffData.fullName}</p>
                </div>
              </div>
            )}
            {/* Staff Dropdown */}
            <div className="relative w-full">
              <label
                className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  watch("selectedStaff") || isOpen
                    ? "text-xs -top-2.5 text-blue-600"
                    : "top-3 text-sm text-gray-500"
                }`}
              >
                Select a Staff
              </label>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="peer h-[52px] w-full text-left px-3 pt-4 pb-1.5 text-sm bg-transparent border border-gray-300 rounded-lg text-gray-900"
              >
                <span className={`${watch("selectedStaff") ? "" : "text-gray-500"}`}>
                  {selectedStaffData?.fullName || ""}
                </span>
              </button>
              {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full p-3 text-sm border-b outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="overflow-y-auto max-h-60">
                    {filteredStaff.length > 0 ? (
                      filteredStaff.map((staff) => (
                        <button
                          key={staff._id}
                          type="button"
                          onClick={() => {
                            setValue("selectedStaff", staff._id);
                            setIsOpen(false);
                          }}
                          className="block w-full px-4 py-3 text-left hover:bg-gray-100"
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
              {errors.selectedStaff && (
                <p className="mt-1 text-sm text-red-500">{errors.selectedStaff.message}</p>
              )}
            </div>

          

            {/* Date */}
            <div className="relative">
              <input
                type="date"
                {...register("date")}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm border border-gray-300 rounded-lg bg-transparent"
                placeholder=" "
              />
              <label className="absolute text-sm text-gray-500 transform scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 top-2 scale-75 -translate-y-4 text-blue-500 start-1">
                Date
              </label>
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            {/* Time Inputs */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative">
                <input
                  type="time"
                  {...register("checkIn")}
                  className="peer w-full px-2.5 pb-2.5 pt-4 text-sm border border-gray-300 rounded-lg bg-transparent"
                  placeholder=" "
                />
                  <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                </svg>
            </div>
                <label className="absolute text-sm text-gray-500 transform scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 top-2 scale-75 -translate-y-4 text-blue-500 start-1">
                  Check-In Time
                </label>
                {errors.checkIn && <p className="text-sm text-red-500">{errors.checkIn.message}</p>}
              </div>

              <div className="relative">
                
                <input
                  type="time"
                  {...register("checkOut")}
                  className="peer w-full px-2.5 pb-2.5 pt-4 text-sm border border-gray-300 rounded-lg bg-transparent"
                  placeholder=" "
                />
                  <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                </svg>
            </div>
                <label className="absolute text-sm text-gray-500 transform scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 top-2 scale-75 -translate-y-4 text-blue-500 start-1">
                  Check-Out Time
                </label>
                {errors.checkOut && (
                  <p className="text-sm text-red-500">{errors.checkOut.message}</p>
                )}
              </div>
            </div>

            {/* Status Radio */}
            <div>
              <label className="block mb-2 font-semibold">Status</label>
              <div className="flex flex-col gap-3">
                {["Present", "Absent"].map((status) => (
                  <label key={status} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value={status}
                      {...register("status")}
                      className="w-3 h-3"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Desktop Image */}
          {selectedStaffData && (
            <div className="hidden w-full lg:block lg:w-1/4">
              <div className="w-full p-4 border rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(selectedStaffData.photo)}`}
                    alt={selectedStaffData.fullName}
                    className="w-16 h-16 border rounded-full"
                  />
                  <p className="text-xl font-semibold">{selectedStaffData.fullName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-white bg-blue-600 rounded-md"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {/* ✅ Success Toast */}
      {toastOpen && (
        <div className="fixed z-50 p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5">
          Attendance marked successfully
        </div>
      )}

      {/* ❌ Error Toasts */}
      {errorMessages.length > 0 && (
        <div className="fixed z-50 max-w-xs space-y-2 top-32 right-5">
          {errorMessages.map((msg, i) => (
            <div key={i} className="p-4 text-white bg-red-600 rounded-md shadow-md">
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarkStaff;
