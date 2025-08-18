import { useState, useEffect } from "react";
import { URL } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import SingleInstructorAttendance from "../attendance/instructor/SingleInstrutorAttendance.jsx";
import {extractDriveFileId} from '../../Components/ImageProxyRouterFunction/funtion.js'
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust path as needed
const InsPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
const {role, user,setUser,setRole,clearAuthState} =  useRole();
  useEffect(() => {
    const fetchInstructor = async () => {
      try {
       
        const { data } = await axios.get(`${URL}/api/user/instructor/${id}`, {
         withCredentials: true
        });

      setInstructor(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Credential Invalid or Expired Please Login Again")
          ) {
            return setTimeout(() => {
              clearAuthState();
              // navigate("/");
            }, 2000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  useEffect(() => {
  }, [instructor]);

    if (loading) {
    return (
              <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>

    );
  }

  return (
    <div className="p-4">
      <section className="flex flex-col bg-white p-5 mb-20 space-y-10 rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left-long text-xl"></i>
            </button>
            <h3 className="font-semibold text-xl">
              Instructor Details
            </h3>
          </div>
          <button
            onClick={() => navigate(`/admin/instructor/${instructor._id}/edit`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Edit
          </button>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full h-full min-h-[20rem] md:min-h-[30rem] bg-gray-300 rounded-lg border-2">
            <div className="relative h-full flex flex-col items-center bg-slate-50">
              <div className="h-[30%] md:h-[40%] w-full flex flex-col items-center rounded-t-lg bg-blue-100"></div>
              <div className="h-[70%] md:h-[60%] flex flex-col items-center space-y-8 absolute top-[20%] md:top-[25%]">
              <img
                   src={`${URL}/api/image-proxy/${extractDriveFileId(instructor.photo)}`}
                  alt={`${instructor.fullName}'s profile`}
                 className="w-56 h-56 object-cover rounded-full border-4 border-white shadow-md"
                />
                <div className="flex flex-col items-center space-y-3">
                  <h1 className="text-blue-600 text-lg font-semibold">
                    {instructor.fullName}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:col-span-3 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
            <h3 className="text-base text-blue-600 font-semibold">
              Personal Details
            </h3>
            <table className="w-full text-xs text-left text-gray-500">
              <tbody>
                {[
                  { label: "Full Name", value: instructor.fullName },
                  { label: "Father's Name", value: instructor.fathersName },
                  { label: "Mobile Number", value: instructor.mobileNumber },
                  { label: "Gender", value: instructor.gender },
                  {
                    label: "Date of Birth",
                    value: moment(instructor.dateOfBirth).format("DD-MM-YYYY"),
                  },
                  { label: "Blood Group", value: instructor.bloodGroup },
                  { label: "Address", value: instructor.address },
                  {
                    label: "Joining Date",
                    value: moment(instructor.createdAt).format("DD-MM-YYYY"),
                  },
                ].map(({ label, value }) => (
                  <tr key={label} className="align-top">
                    <td className="px-4 py-3 text-base font-medium text-gray-700">
                      {label}
                    </td>
                    <td className="px-4 py-3 text-sm">{value || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full col-span-1 md:col-span-4 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
          <section className="">
            <SingleInstructorAttendance />
          </section>
        </div>
      </section>
    </div>
  );
};

export default InsPreview;
