import { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "../../App";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion";
import branchHeaders from "../../Components/utils/headers";

const AssignAdmin = ({ branch, onClose }) => {
  const [branchAdmins, setBranchAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState(null);

  // 🔹 Fetch branch admins
  useEffect(() => {
    const fetchBranchAdmins = async () => {
      try {
        const res = await axios.get(
          `${URL}/api/v1/branches/${branch._id}`,
          branchHeaders()
        );
        setBranchAdmins(res.data?.branchAdmins || []);
      } catch (err) {
        console.error("Failed to fetch branch admins:", err);
      }
    };
    fetchBranchAdmins();
  }, [branch._id]);

  // 🔹 Remove admin from branch
  const handleRemove = async () => {
    if (!adminToRemove) return;
    try {
      await axios.delete(
        `${URL}/api/v1/branches/remove-admin/${branch._id}/${adminToRemove}`,
        branchHeaders()
      );
      setBranchAdmins(branchAdmins.filter((a) => a._id !== adminToRemove));
      setIsChanged(true);
      setShowRemoveModal(false);
      setAdminToRemove(null);
    } catch (err) {
      console.error("Failed to remove admin:", err);
    }
  };

  // 🔹 Fetch unassigned admins when modal opens
  const fetchUnassignedAdmins = async () => {
    try {
      const res = await axios.get(
        `${URL}/api/v1/admins/un-assigned-admin`,
        branchHeaders()
      );
      setAvailableAdmins(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch unassigned admins:", err);
    }
  };

  // 🔹 Assign admin to branch
  const handleAssign = async (adminId) => {
    try {
      await axios.post(
        `${URL}/api/v1/branches/assign-admin/${branch._id}/${adminId}`,
        {},
        branchHeaders()
      );
      setShowModal(false);
      const res = await axios.get(
        `${URL}/api/v1/branches/${branch._id}`,
        branchHeaders()
      );
      setBranchAdmins(res.data?.branchAdmins || []);
      setIsChanged(true);
    } catch (err) {
      console.error("Failed to assign admin:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[70%] h-[70%] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Manage Branch Admins</h2>
          <button
            onClick={() => {
              setShowModal(true);
              fetchUnassignedAdmins();
            }}
            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            + Assign Admin
          </button>
        </div>

        {/* Branch Admins Table */}
        <table className="w-full border">
          <thead className="text-center bg-gray-100">
            <tr>
              <th className="p-2 border">Photo</th>
              <th className="p-2 border">Full Name</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {branchAdmins.length > 0 ? (
              branchAdmins.map((admin) => (
                <tr key={admin._id} className="text-center bg-white">
                  <td className="p-2 border-b">
                    <img
                      src={`${URL}/api/image-proxy/${extractDriveFileId(
                        admin.photo
                      )}?t=${Date.now()}`}
                      alt={admin.fullName}
                      className="object-cover w-16 h-16 mx-auto border-gray-100 rounded-full shadow-md"
                    />
                  </td>
                  <td className="p-2 border-b">{admin.fullName}</td>
                  <td className="p-2 border-b">{admin.mobileNumber}</td>
                  <td className="p-2 border-b">
                    <button
                      onClick={() => {
                        setAdminToRemove(admin._id);
                        setShowRemoveModal(true);
                      }}
                      className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No admins assigned to this branch.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Remove Confirmation Modal */}
        {showRemoveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
              <h3 className="mb-4 text-lg font-semibold text-center text-gray-800">
                Are you sure you want to remove this admin?
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="w-20 py-2.5 px-5 text-sm font-medium text-blue-700 bg-white rounded-lg border border-blue-600 hover:text-blue-700 dark:hover:text-white hover:bg-gray-100 "
    
                >
                  No
                </button>
                <button
                  onClick={handleRemove}
                  className="w-20 py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Admin Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[60%] h-[60%] overflow-auto">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">Assign Admins</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>

              <table className="w-full border">
                <thead className="text-center bg-gray-100">
                  <tr>
                    <th className="p-2 border">Photo</th>
                    <th className="p-2 border">Full Name</th>
                    <th className="p-2 border">Mobile</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableAdmins.length > 0 ? (
                    availableAdmins.map((admin) => (
                      <tr key={admin._id} className="text-center">
                        <td className="p-2 border-b">
                          <img
                            src={`${URL}/api/image-proxy/${extractDriveFileId(
                              admin.photo
                            )}?t=${Date.now()}`}
                            alt={admin.fullName}
                            className="object-cover w-12 h-12 mx-auto border-gray-100 rounded-full shadow-md"
                          />
                        </td>
                        <td className="p-2 border-b">{admin.fullName}</td>
                        <td className="p-2 border-b">{admin.mobileNumber}</td>
                        <td className="p-2 border-b">
                          <button
                            onClick={() => handleAssign(admin._id)}
                            className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-4 text-center text-gray-500"
                      >
                        No available admins.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => onClose(isChanged)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAdmin;
