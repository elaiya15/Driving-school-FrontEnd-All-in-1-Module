import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App.jsx";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import branchHeaders from "../../Components/utils/headers.jsx";

const OrganizationProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearAuthState } = useRole();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await axios.get(
          `${URL}/api/v1/organization/getSingleOrganization/${id}`,
          branchHeaders()
        );
        const data = res.data;
        setOrg(data);

        if (data.logo) {
          const driveId = extractDriveFileId(data.logo);
          const logoUrl = driveId
            ? `${URL}/api/image-proxy/${driveId}`
            : `${data.logo}?t=${Date.now()}`;
          setLogoPreview(logoUrl);
        }
      } catch (err) {
        if (
          err?.response?.status === 401 ||
          err?.response?.data?.message ===
            "Credential Invalid or Expired Please Login Again"
        ) {
          setTimeout(() => clearAuthState(), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id]);

  if (loading)
    return (
      <div className="py-4 text-center text-blue-600">
        Loading Organization...
      </div>
    );

  if (!org)
    return (
      <div className="py-4 text-center text-red-600">
        Organization not found
      </div>
    );

  return (
    <div className="p-4">
      <div className="mb-4">
        <button onClick={() => navigate(-1)}>
          <i className="text-xl fa-solid fa-arrow-left-long"></i>
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Organization Profile</h2>
        <button
          onClick={() => navigate(`/owner/organization/profile/${id}/edit`)}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Edit
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label>Organization Name</label>
          <input
            value={org.organizationName || ""}
            disabled
            className="w-full p-2 bg-gray-100 border rounded"
          />
        </div>

        <div>
          <label>Email</label>
          <input
            value={org.organizationEmail || ""}
            disabled
            className="w-full p-2 bg-gray-100 border rounded"
          />
        </div>

        <div>
          <label>Mobile Number</label>
          <input
            value={org.organizationMobileNumber || ""}
            disabled
            className="w-full p-2 bg-gray-100 border rounded"
          />
        </div>

        <div>
          <label>State</label>
          <input
            value={org.organizationAddress?.state || ""}
            disabled
            className="w-full p-2 bg-gray-100 border rounded"
          />
        </div>

        <div>
          <label>City</label>
          <input
            value={org.organizationAddress?.city || ""}
            disabled
            className="w-full p-2 bg-gray-100 border rounded"
          />
        </div>

        <div>
          <label>Pincode</label>
          <input
            value={org.organizationAddress?.pincode || ""}
            disabled
            className="w-full p-2 bg-gray-100 border rounded"
          />
        </div>

        <div>
          <label>Address</label>
          <input
            value={org.organizationAddress?.address || ""}
            disabled
            className="w-full p-2 bg-gray-100 border rounded"
          />
        </div>

        <div>
          <label>Organization Logo</label>
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Organization Logo"
              className="object-cover w-32 h-32 mt-2 border rounded"
            />
          ) : (
            <p className="mt-2 text-gray-500">No logo uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfileView;
