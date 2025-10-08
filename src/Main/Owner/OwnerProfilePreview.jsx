import { useState, useEffect } from "react";
import { URL } from "../../App.jsx";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import branchHeaders from "../../Components/utils/headers.jsx";

const OwnerPreview = () => {
  const navigate = useNavigate();
  const { id, branchId } = useParams();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearAuthState } = useRole();

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const { data } = await axios.get(
          `${URL}/api/v1/organization/${id}`,
          branchHeaders()
        );
        setOwner(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message ===
              "Credential Invalid or Expired Please Login Again")
        ) {
          setTimeout(() => clearAuthState(), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOwner();
  }, [id, clearAuthState]);

  if (loading) {
    return (
      <div className="py-5 text-lg font-semibold text-center text-blue-600">
        Loading...
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="py-5 text-lg font-semibold text-center text-red-600">
        No data found.
      </div>
    );
  }

  return (
    <div className="p-4">
      <section className="flex flex-col p-5 mb-20 space-y-10 bg-white rounded-t-lg">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)}>
              <i className="text-xl fa-solid fa-arrow-left-long"></i>
            </button>
            <h3 className="text-xl font-semibold">Owner Details</h3>
          </div>
          <button
            onClick={() => navigate(`/owner/profile/${id}/edit`)}
            className="px-4 py-2 text-white transition duration-300 bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
        </div>

        {/* Profile + Details */}
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {/* Profile Image */}
          <div className="w-full h-full min-h-[20rem] md:min-h-[30rem] bg-gray-300 rounded-lg border-2">
            <div className="relative flex flex-col items-center h-full bg-slate-50">
              <div className="h-[30%] md:h-[40%] w-full flex flex-col items-center rounded-t-lg bg-blue-100"></div>
              <div className="h-[70%] md:h-[60%] flex flex-col items-center space-y-8 absolute top-[20%] md:top-[25%]">
                {owner.photo ? (
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      owner.photo
                    )}`}
                    alt={`${owner.ownerName}'s profile`}
                    className="object-cover w-56 h-56 border-4 border-white rounded-full shadow-md"
                  />
                ) : (
                  <div className="flex items-center justify-center w-56 h-56 text-gray-500 bg-gray-200 border-4 border-white rounded-full shadow-md">
                    No Photo
                  </div>
                )}
                <div className="flex flex-col items-center space-y-3">
                  <h1 className="text-lg font-semibold text-blue-600">
                    {owner.ownerName}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="flex flex-col w-full h-full p-6 space-y-5 border-2 rounded-lg md:col-span-3 md:p-8">
            <h3 className="text-base font-semibold text-blue-600">
              Personal Details
            </h3>
            <table className="w-full text-xs text-left text-gray-500">
              <tbody>
                {[
                  { label: "Owner Name", value: owner.ownerName },
                  { label: "Email", value: owner.email },
                  { label: "Mobile Number", value: owner.mobileNumber },
                  {
                    label: "Alternative Number",
                    value: owner.AlternativeNumber,
                  },
                  { label: "Username", value: owner.userId.username },
                  { label: "Role", value: owner.userId.role },
                  //   { label: "Active", value: owner.active ? "Yes" : "No" },
                  //   { label: "Organization ID", value: owner.organizationId },
                  //   {
                  //     label: "Created At",
                  //     value: moment(owner.createdAt).format("DD-MM-YYYY"),
                  //   },
                  //   {
                  //     label: "Updated At",
                  //     value: moment(owner.updatedAt).format("DD-MM-YYYY"),
                  //   },
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

          {/* User Account Details */}
          {/* {owner.userId && (
            <div className="flex flex-col w-full h-full p-6 space-y-5 border-2 rounded-lg md:col-span-3 md:p-8">
              <h3 className="text-base font-semibold text-blue-600">
                User Account Details
              </h3>
              <table className="w-full text-xs text-left text-gray-500">
                <tbody>
                  {[
                    { label: "Username", value: owner.userId.username },
                    { label: "Role", value: owner.userId.role },
                    { label: "Decrypted Password", value: owner.userId.decryptedPassword },
                    {
                      label: "User Created At",
                      value: moment(owner.userId.createdAt).format("DD-MM-YYYY"),
                    },
                    {
                      label: "User Updated At",
                      value: moment(owner.userId.updatedAt).format("DD-MM-YYYY"),
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
          )} */}
        </div>
      </section>
    </div>
  );
};

export default OwnerPreview;
