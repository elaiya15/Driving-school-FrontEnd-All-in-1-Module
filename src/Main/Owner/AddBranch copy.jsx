import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";

const schema = Yup.object().shape({
  branchName: Yup.string().required("Branch name is required"),
  address: Yup.object().shape({
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    pincode: Yup.string().required("Pincode is required"),
    address: Yup.string().required("Address is required"),
  }),
  branchAdminID: Yup.string().nullable(), // optional
});

const BranchCreate = () => {
  const { user } = useRole();
  
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      branchName: "",
      address: {
        state: "",
        city: "",
        pincode: "",
        address: "",
      },
      branchAdminID: "",
    },
  });

  useEffect(() => {
    const fetchAdmins = async () => {
        if (!user || !user.organizationId) return;
      try {
        const res = await axios.get(`${URL}/api/admins/${user.organizationId}`, {
          params: { search },
        });
        setAdmins(res.data);
      } catch (err) {
        console.error("Failed to fetch admins", err);
      }
    };
    fetchAdmins();
  }, [search, user.organizationId]);

  const onSubmit = async (data) => {
    if (!user || !user.organizationId) {
      console.error("User or organization ID is not available");
      return;
    }
    try {
      const res = await axios.post(
        `${URL}/api/branches/create/${user.organizationId}`,
        data,
        { withCredentials: true }
      );
      console.log("Branch created:", res.data);
    } catch (err) {
      console.error("Error creating branch", err);
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-xl font-semibold">Create Branch</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Branch Name */}
        <div>
          <label className="block font-medium">Branch Name</label>
          <input
            type="text"
            {...register("branchName")}
            className="w-full p-2 border rounded"
          />
          {errors.branchName && (
            <p className="text-sm text-red-500">{errors.branchName.message}</p>
          )}
        </div>

        {/* Address Fields */}
        <div>
          <label className="block font-medium">State</label>
          <input
            type="text"
            {...register("address.state")}
            className="w-full p-2 border rounded"
          />
          {errors.address?.state && (
            <p className="text-sm text-red-500">
              {errors.address.state.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">City</label>
          <input
            type="text"
            {...register("address.city")}
            className="w-full p-2 border rounded"
          />
          {errors.address?.city && (
            <p className="text-sm text-red-500">
              {errors.address.city.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Pincode</label>
          <input
            type="text"
            {...register("address.pincode")}
            className="w-full p-2 border rounded"
          />
          {errors.address?.pincode && (
            <p className="text-sm text-red-500">
              {errors.address.pincode.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Address</label>
          <textarea
            {...register("address.address")}
            className="w-full p-2 border rounded"
          />
          {errors.address?.address && (
            <p className="text-sm text-red-500">
              {errors.address.address.message}
            </p>
          )}
        </div>

        {/* Branch Admin Dropdown */}
        <div>
          <label className="block font-medium">Branch Admin (Optional)</label>
          <input
            type="text"
            placeholder="Search admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <select {...register("branchAdminID")} className="w-full p-2 border rounded">
            <option value="">-- No Admin Assigned --</option>
            {admins.map((admin) => (
              <option key={admin._id} value={admin._id}>
                {admin.name} ({admin.email})
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Create Branch
        </button>
      </form>
    </div>
  );
};

export default BranchCreate;
