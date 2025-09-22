import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import branchHeaders from "../../Components/utils/headers";

const Toast = ({ message  }) => (
  <div className="fixed top-5 right-5 z-50 w-[300px] max-w-xs p-4 text-white bg-red-600 rounded-md shadow-md animate-fade-in-down">
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
  const [errorMsg, setErrorMsg] = useState("");
  const [succesMsg, setSuccesMsg] = useState("");

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

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        let orgId = user ? user.organizationId : null;
        const res = await axios.get(`${URL}/api/v1/branches/${id}`, branchHeaders());
        reset(res?.data || {});

      }catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data?.message ===
                "Credential Invalid or Expired Please Login Again")
          ) {
            setErrorMsg("Credential Invalid or Expired Please Login Again");
            return setTimeout(() => {
              clearAuthState();
              setErrorMsg("")
            }, 2000);
          }

          // ✅ Handle custom error messages
          const errorData = error?.response?.data;
          const errors = errorData?.errors || errorData?.message || "An error occurred";

          if (Array.isArray(errors)) {
            setErrorMsg(errors.join(", "));
          } else {
            setErrorMsg(errors);
          }

          // ✅ Auto-clear error toast
          setTimeout(() => {
            setErrorMsg("");
          }, 4000);
        }
      }  finally {
      setLoading(false);
     }
    };
    fetchBranch();
  }, [id, user, reset]);

  const onSubmit = async (data) => {
    try {
      await axios.put(`${URL}/api/v1/branches/${id}`, data, branchHeaders());
    //   alert("Branch updated successfully!");
      navigate(-1);
    } 
    catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data?.message ===
                "Credential Invalid or Expired Please Login Again")
          ) {
            setErrorMsg("Credential Invalid or Expired Please Login Again");
            return setTimeout(() => {
              clearAuthState();
              setErrorMsg("")
            }, 2000);
          }

          // ✅ Handle custom error messages
          const errorData = error?.response?.data;
          const errors = errorData?.errors || errorData?.message || "An error occurred";

          if (Array.isArray(errors)) {
            setErrorMsg(errors.join(", "));
          } else {
            setErrorMsg(errors);
          }

          // ✅ Auto-clear error toast
          setTimeout(() => {
            setErrorMsg("");
          }, 4000);
        }
      }  finally {
      setLoading(false);
     }

  };

  if (loading) return <p className="py-6 text-center">Loading branch details...</p>;

  return (
    <div className="p-6">
              {errorMsg && <Toast message={errorMsg} />}

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
