import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { URL } from "../../../App";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext";
import branchHeaders from "../../../Components/utils/headers.jsx";

const validationSchema = yup.object().shape({
  selectedInstructor: yup.string().required("Please select an instructor"),
  date: yup.string().required("Please select a date"),
  checkIn: yup.string().required("Please enter check-in time"),
  checkOut: yup
    .string()
    .required("Please enter check-out time")
    .test("is-after", "Check-out must be after check-in", function (value) {
      const { checkIn } = this.parent;
      return checkIn && value && checkIn < value;
    }),
  status: yup.string().required("Please select a status"),
});

const MarkIns = () => {
  const { role, clearAuthState } = useRole();
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorData, setSelectedInstructorData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      selectedInstructor: "",
      date: "",
      checkIn: "",
      checkOut: "",
      status: "",
    },
  });

  const selectedInstructor = watch("selectedInstructor");

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get(`${URL}/api/v2/instructor`, branchHeaders());
        setInstructors(response.data.instructorsWithDecrypted);
      } catch (err) {
        if (
          err?.response?.status === 401 || err?.response?.status === 403||
          err?.response?.data?.message === "Invalid token"
        ) {
          setTimeout(() => {
            clearAuthState();
            navigate("/");
          }, 2000);
        }
      }
    };
    fetchInstructors();
  }, []);

  useEffect(() => {
    const instructor = instructors.find((inst) => inst._id === selectedInstructor);
    setSelectedInstructorData(instructor || null);
  }, [selectedInstructor, instructors]);

  const onSubmit = async (data) => {
    const { selectedInstructor, date, checkIn, checkOut, status } = data;
    const payload = {
      instructor: selectedInstructor,
      date,
      checkIn: `${date}T${checkIn}:00.000Z`,
      checkOut: `${date}T${checkOut}:00.000Z`,
      status,
    };

    try {
      await axios.post(`${URL}/api/v2/instructor-attendance`, payload, branchHeaders());
      setToastOpen(true);
      reset(); // Reset form
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (err) {
           // ✅ 401 handling
           if (err.response?.status === 401|| err.response?.status === 403) {
          setErrorMessages(err.response?.data?.message||err.response?.data?.error );
          return setTimeout(() => {
            clearAuthState();
            setErrorMessages("");
          }, 2000);
        }

    //   if (
    //     err?.response?.status === 401 ||
    //     err?.response?.data?.message === "Credential Invalid or Expired Please Login Again"
    //   ) {
    // setErrorMessages(["Credential Invalid or Expired Please Login Again"]);
    //     return setTimeout(() => {
    //       clearAuthState();
    //       navigate("/");
    //     }, 2000);
    //   }

      const errorMsg = err?.response?.data?.errors || err?.message || "An error occurred";
      const messages = Array.isArray(errorMsg) ? errorMsg : [errorMsg];
      setErrorMessages(messages);
      setTimeout(() => setErrorMessages([]), 4000);
    }
  };

  const filteredInstructors = instructors.filter((inst) =>
    inst?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">Mark Attendance</h2>
      <div className="flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full ">
     <div className="flex flex-col-reverse justify-between w-full gap-6 md:gap-0 md:flex-row gap-x-1 ">
     <div className="flex flex-col gap-6 md:px-2 md:w-[70%] ">
        {/* Instructor Dropdown */}
        
        <div className="relative">
          <label
            className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
              watch("selectedInstructor") || isOpen
                ? "text-xs -top-2.5 text-blue-600"
                : "top-3 text-sm text-gray-500"
            }`}
          >
            Select an instructor
          </label>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="h-[52px] w-full text-left px-3 pt-4 pb-1.5 text-sm bg-transparent border border-gray-300 rounded-lg"
          >
            {
              selectedInstructorData
                ? selectedInstructorData.fullName
                : ""
            }
          </button>
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border rounded-md shadow-lg">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-3 text-sm border-blue-50 "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="overflow-y-auto bg-white max-h-60">
                {filteredInstructors.length > 0 ? (
                  filteredInstructors.map((inst) => (
                    <button
                      key={inst._id}
                      type="button"
                      onClick={() => {
                        setValue("selectedInstructor", inst._id);
                        setIsOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left text-gray-700 bg-white hover:bg-gray-100"
                    >
                      {inst.fullName}
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-gray-500">No results found</p>
                )}
              </div>
            </div>
          )}
          {errors.selectedInstructor && (
            <p className="mt-1 text-sm text-red-500">{errors.selectedInstructor.message}</p>
          )}
        </div>

        {/* Instructor Image Mobile */}
        {/* {selectedInstructorData && (
          <div className="block w-full p-4 border rounded-md lg:hidden">
            <div className="flex flex-col items-center gap-2">
              <img
                src={`${URL}/api/image-proxy/${extractDriveFileId(selectedInstructorData.photo)}`}
                alt={selectedInstructorData.fullName}
                className="border rounded-full w-14 h-14"
              />
              <p className="font-semibold">{selectedInstructorData.fullName}</p>
            </div>
          </div>
        )} */}

        {/* Date */}
        <div className="relative w-full">
              <input
          type="date"
          {...register("date")}
           className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
           placeholder=" "
              />
              <label
                htmlFor="date"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
              >
                Date
              </label>
                      {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>

        {/* Time Fields */}
        <div className="grid gap-6 lg:grid-cols-2">
           <div>
        <div className="relative">
            <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                </svg>
            </div>
            <input type="time"  {...register("checkIn")} id="start-time" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
           <label
           htmlFor="checkIn"
           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
         >
           Check-In Time
         </label>
               
              </div>
           
                   {errors.checkIn && <p className="text-sm text-red-500">{errors.checkIn.message}</p>}
       
           </div>
                 
                 <div>
               <div className="relative">
                   <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                       <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                           <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                       </svg>
                   </div>
       
                   <input type="time"  {...register("checkOut")}  id="end-time" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"   />
                           <label
           htmlFor="checkOut"
           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
         >
           Check-Out Time
         </label>
               </div>
           
                   {errors.checkOut && <p className="text-sm text-red-500">{errors.checkOut.message}</p>}
       
           </div>
               
               </div>
       
               {/* Status Radio */}
               <div>
                 <label className="block mb-2 font-semibold">Status</label>
                 <div className="flex flex-col gap-2">
                   {["Present", "Absent"].map((stat) => (
                     <label key={stat} className="flex items-center gap-2 text-sm">
                       <input type="radio" value={stat} {...register("status")} />
                       {stat}
                     </label>
                   ))}
                 </div>
                 {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
               </div>
       
     
     
     </div>
      {/* Desktop Instructor Image */}
        {selectedInstructorData && (
          <div className="w-full md:w-1/3">
            <div className="p-4 border rounded-md">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={`${URL}/api/image-proxy/${extractDriveFileId(selectedInstructorData.photo)}`}
                  alt={selectedInstructorData.fullName}
                  className="w-16 h-16 border rounded-full"
                />
                <p className="text-xl font-semibold">{selectedInstructorData.fullName}</p>
              </div>
            </div>
          </div>
        )}
     </div>
   {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 text-white bg-gray-600 rounded-md"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-white bg-blue-600 rounded-md"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
     </form>
</div>
  

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

export default MarkIns;
