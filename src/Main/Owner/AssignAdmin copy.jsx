import { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "../../App";

const AssignAdmin = ({ branch, onClose }) => {
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState(branch.branchAdmins || []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get(`${URL}/api/v1/admins/un-assigned-admin`, { withCredentials: true });
        console.log(res.data.data);
        
        setAvailableAdmins(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      }
    };
    fetchAdmins();
  }, []);

  const toggleAdmin = (admin) => {
    if (selectedAdmins.find((a) => a._id === admin._id)) {
      setSelectedAdmins(selectedAdmins.filter((a) => a._id !== admin._id));
    } else {
      setSelectedAdmins([...selectedAdmins, admin]);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${URL}/api/v1/branches/${branch._id}/assign-admins`,
        { admins: selectedAdmins.map((a) => a._id) },
        { withCredentials: true }
      );
      onClose(true); // ✅ success
    } catch (err) {
      console.error("Error assigning admins:", err);
      onClose(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[50%]  overflow-auto h-[50%]">
        <div className= "flex justify-between">
        <h2 className="mb-4 text-lg font-bold">
          {branch.branchAdmins?.length ? "Re-Assign Admins" : "Assign Admins"}
        </h2>
  <button
        //   onClick={() => navigate("/owner/branches/create")}
          className="w-3 h-8 px-2 py-1 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          + Add Admin
        </button>
        </div>

        <div className="p-2 overflow-y-auto border rounded max-h-60">
          {availableAdmins.map((admin) => (
            <label
              key={admin._id}
              className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={!!selectedAdmins.find((a) => a._id === admin._id)}
                onChange={() => toggleAdmin(admin)}
              />
              <span>{admin.fullName}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAdmin;
