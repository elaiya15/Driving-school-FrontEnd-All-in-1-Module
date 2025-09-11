import { useState, useEffect } from "react";
import { URL } from "../../App";
import { useNavigate, useParams,useLocation  } from "react-router-dom";
import SingleStaff from "../attendance/staff/SingleStaff";
import axios from "axios";
import moment from "moment";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";
import branchHeaders from "../../Components/utils/headers.jsx";

const StaffPreview = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const {role, user,setUser,setRole,clearAuthState} =  useRole();
      const [reloadKey, setReloadKey] = useState(Date.now());

  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchstaff = async () => {
      try {
    
        const response = await axios.get(`${URL}/api/v2/staff/${id}`, branchHeaders());

        setStaff(response.data.staff);
        setReloadKey(Date.now()); // triggers image refresh
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
              navigate("/");
            }, 2000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchstaff();
  }, [id,location.key]);

  if (loading) {
    return (
               <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>

    );
  }

  return (
    <div className="p-4">
      <section className="flex flex-col p-5 mb-20 space-y-10 bg-white rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)}>
              <i className="text-xl fa-solid fa-arrow-left-long"></i>
            </button>
            <h3 className="text-xl font-semibold">Staff Details</h3>
          </div>
          <button
            onClick={() => navigate(`/admin/staff/${staff._id}/edit`)}
            className="px-4 py-2 text-white transition duration-300 bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="w-full h-full min-h-[20rem] md:min-h-[30rem] bg-gray-300 rounded-lg border-2">
            <div className="relative flex flex-col items-center h-full bg-slate-50">
              <div className="h-[30%] md:h-[40%] w-full flex flex-col items-center rounded-t-lg bg-blue-100"></div>
              <div className="h-[70%] md:h-[60%] flex flex-col items-center space-y-8 absolute top-[20%] md:top-[25%]">
                <img
                src={`${URL}/api/image-proxy/${extractDriveFileId(staff.photo)}?t=${reloadKey}`}
                  alt={`${staff.fullName}'s profile`}
                  className="object-cover w-56 h-56 border-4 border-white rounded-full shadow-md"
                />
                <div className="flex flex-col items-center space-y-3">
                  <h1 className="text-lg font-semibold text-blue-600">
                    {staff?.fullName}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full h-full p-6 space-y-5 border-2 rounded-lg md:col-span-3 md:p-8">
            <h3 className="text-base font-semibold text-blue-600">
              Personal Details
            </h3>
            <table className="w-full text-xs text-left text-gray-500">
              <tbody>
                {[
                  { label: "Full Name", value: staff.fullName },
                  { label: "Father's Name", value: staff.fathersName },
                  { label: "Mobile Number", value: staff.mobileNumber },
                  { label: "Gender", value: staff?.gender },
                  {
                    label: "Date of Birth",
                    value: moment(staff.dateOfBirth).format("DD-MM-YYYY"),
                  },
                  { label: "Blood Group", value: staff.bloodGroup },
                  { label: "Address", value: staff.address },
                  {
                    label: "Joining Date",
                    value: moment(staff.createdAt).format("DD-MM-YYYY"),
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
        <div className="flex flex-col w-full h-full col-span-1 p-6 space-y-5 border-2 rounded-lg md:col-span-4 md:p-8">
          <section className="">
            <SingleStaff />
          </section>
        </div>
      </section>
    </div>
  );
};

export default StaffPreview;
