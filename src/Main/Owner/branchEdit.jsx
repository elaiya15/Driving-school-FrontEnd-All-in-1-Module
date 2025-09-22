import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import branchHeaders from "../../Components/utils/headers";

// ✅ Reusable Toast Component
const Toast = ({ message, type }) => (
  <div
    className={`fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white rounded-md shadow-md transition-all duration-300 animate-fade-in-down
      ${type === "success" ? "bg-blue-600" : "bg-red-600"}`}
  >
    {message}
  </div>
);

const schema = Yup.object().shape({
  branchName: Yup.string().required("Branch Name is required"),
  address: Yup.object().shape({
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    pincode: Yup.string().required("Pincode is required"),
    address: Yup.string().required("Address is required"),
  }),
});

const BranchEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, clearAuthState } = useRole();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" }); // {message,type}

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      branchName: "",
      address: { state: "", city: "", pincode: "", address: "" },
    },
  });

  // ✅ Auto-hide toast helper
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  // ✅ Fetch existing branch
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        let orgId = user ? user.organizationId : null;
        const res = await axios.get(`${URL}/api/v1/branches/${id}`, branchHeaders());
        reset(res?.data || {});
      } catch (error) {
        console.error("Error fetching branch:", error);

        if (
          error?.response?.status === 401 ||
          error?.response?.data?.message ===
            "Credential Invalid or Expired Please Login Again"
        ) {
          showToast("Credential Invalid or Expired. Please login again.");
          return setTimeout(() => clearAuthState(), 2000);
        }

        const errData = error?.response?.data;
        const msg = Array.isArray(errData?.errors)
          ? errData.errors.join(", ")
          : errData?.message || "Failed to load branch";
        showToast(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [id, user, reset, clearAuthState]);

  // ✅ Update branch
  const onSubmit = async (data) => {
    try {
      await axios.put(`${URL}/api/v1/branches/${id}`, data, branchHeaders());
      showToast("Branch updated successfully!", "success");

      // Redirect after a short delay
      setTimeout(() => navigate(-1), 1200);
    } catch (error) {
      console.error("Error updating branch:", error);

      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message ===
          "Credential Invalid or Expired Please Login Again"
      ) {
        showToast("Credential Invalid or Expired. Please login again.");
        return setTimeout(() => clearAuthState(), 2000);
      }

      const errData = error?.response?.data;
      const msg = Array.isArray(errData?.errors)
        ? errData.errors.join(", ")
        : errData?.message || "Update failed";
      showToast(msg);
    }
  };

  if (loading) return  <div className="py-5 text-lg font-semibold text-center text-blue-600">
        Loading...
      </div>

  return (
    <div className="p-6">
      {/* ✅ Toast Messages */}
      {toast.message && <Toast message={toast.message} type={toast.type} />}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl p-6 mx-auto space-y-6 bg-white shadow-lg rounded-xl"
      >
        <h2 className="text-xl font-bold text-gray-700">Edit Branch</h2>

        {/* Branch Name */}
        <div className="relative">
          <input
            {...register("branchName")}
            placeholder=" "
            className={`peer w-full border rounded-lg px-3 pt-5 pb-2 focus:outline-none ${
              errors.branchName ? "border-red-500" : "border-gray-300"
            }`}
          />
          <label className="absolute left-3 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
            Branch Name
          </label>
          {errors.branchName && (
            <p className="text-sm text-red-500">{errors.branchName.message}</p>
          )}
        </div>

        {/* State */}
        <div className="relative">
          <input
            {...register("address.state")}
            placeholder=" "
            className={`peer w-full border rounded-lg px-3 pt-5 pb-2 focus:outline-none ${
              errors.address?.state ? "border-red-500" : "border-gray-300"
            }`}
          />
          <label className="absolute left-3 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
            State
          </label>
          {errors.address?.state && (
            <p className="text-sm text-red-500">{errors.address.state.message}</p>
          )}
        </div>

        {/* City */}
        <div className="relative">
          <input
            {...register("address.city")}
            placeholder=" "
            className={`peer w-full border rounded-lg px-3 pt-5 pb-2 focus:outline-none ${
              errors.address?.city ? "border-red-500" : "border-gray-300"
            }`}
          />
          <label className="absolute left-3 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
            City
          </label>
          {errors.address?.city && (
            <p className="text-sm text-red-500">{errors.address.city.message}</p>
          )}
        </div>

        {/* Pincode */}
        <div className="relative">
          <input
            {...register("address.pincode")}
            placeholder=" "
            className={`peer w-full border rounded-lg px-3 pt-5 pb-2 focus:outline-none ${
              errors.address?.pincode ? "border-red-500" : "border-gray-300"
            }`}
          />
          <label className="absolute left-3 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
            Pincode
          </label>
          {errors.address?.pincode && (
            <p className="text-sm text-red-500">{errors.address.pincode.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="relative">
          <textarea
            {...register("address.address")}
            placeholder=" "
            rows="3"
            className={`peer w-full border rounded-lg px-3 pt-5 pb-2 focus:outline-none ${
              errors.address?.address ? "border-red-500" : "border-gray-300"
            }`}
          />
          <label className="absolute left-3 top-[-5] text-sm text-gray-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base">
            Address
          </label>
          {errors.address?.address && (
            <p className="text-sm text-red-500">{errors.address.address.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Update Branch
        </button>
      </form>
    </div>
  );
};

export default BranchEdit;
