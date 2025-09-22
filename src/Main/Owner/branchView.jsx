import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import branchHeaders from "../../Components/utils/headers";

const BranchSingleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, clearAuthState } = useRole();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        let orgId = user ? user.organizationId : null;
        const res = await axios.get(
          `${URL}/api/v1/branches/${id}`,


          branchHeaders()
        );
        console.log(res.data);
        setBranch(res?.data || null);
      } catch (error) {
        console.error(error);
        if (
          error?.response?.status === 401 ||
          error?.response?.data?.message ===
            "Credential Invalid or Expired Please Login Again"
        ) {
        //   setTimeout(() => clearAuthState(), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [id, user, clearAuthState]);

  if (loading) {
    return (
      <div className="py-5 text-lg font-semibold text-center text-blue-600">
        Loading...
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="py-5 text-center text-red-600">
        Branch not found or failed to load.
      </div>
    );
  }

  return (
    <div className="p-4">
      <section className="flex flex-col p-5 mb-20 space-y-10 bg-white rounded-t-lg shadow">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)}>
              <i className="text-xl fa-solid fa-arrow-left-long"></i>
            </button>
            <h3 className="text-xl font-semibold">Branch Details</h3>
          </div>
          <button
            onClick={() => navigate(  `/owner/branches/${branch._id || "unassigned"}/edit`)}
            className="px-4 py-2 text-white transition duration-300 bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
        </div>

        {/* Details Card */}
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column (Optional logo placeholder) */}
          {/* <div className="w-full min-h-[20rem] bg-gray-100 rounded-lg border-2 flex items-center justify-center">
            <span className="text-gray-400">No Branch Logo</span>
          </div> */}

          {/* Right Column Details */}
          <div className="flex flex-col w-full h-full p-6 space-y-5 border-2 rounded-lg md:col-span-3 md:p-8">
            <h3 className="text-base font-semibold text-blue-600">
              Branch Information
            </h3>
            <table className="w-full text-sm text-left text-gray-500">
              <tbody>
                {[
                  { label: "Branch Name", value: branch.branchName },
                  { label: "State", value: branch.address?.state },
                  { label: "City", value: branch.address?.city },
                  { label: "Pincode", value: branch.address?.pincode },
                  { label: "Address", value: branch.address?.address },
                  {
                    label: "Created Date",
                    value: branch.createdAt
                      ? moment(branch.createdAt).format("DD-MM-YYYY")
                      : "N/A",
                  },
                  {
                    label: "Updated Date",
                    value: branch.updatedAt
                      ? moment(branch.updatedAt).format("DD-MM-YYYY")
                      : "N/A",
                  },
                ].map(({ label, value }) => (
                  <tr key={label} className="align-top">
                    <td className="px-4 py-3 text-base font-medium text-gray-700">
                      {label}
                    </td>
                    <td className="px-4 py-3">{value || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BranchSingleView;
