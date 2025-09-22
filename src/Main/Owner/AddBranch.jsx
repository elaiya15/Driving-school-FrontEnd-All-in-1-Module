import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import branchHeaders from "../../Components/utils/headers";
const BranchCreate = () => {
      const { user } = useRole();
  const [admins, setAdmins] = useState([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [searchAdmin, setSearchAdmin] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");

  // ✅ Validation Schema
  const schema = Yup.object().shape({
    branchName: Yup.string().required("Branch Name is required"),
    address: Yup.object().shape({
      state: Yup.string().required("State is required"),
      city: Yup.string().required("City is required"),
      pincode: Yup.string().required("Pincode is required"),
      address: Yup.string().required("Address is required"),
    }),
    // branchAdmins: Yup.string().required("Branch Admin is required"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
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
    //   branchAdmins: "",
    },
  });

//   // ✅ Fetch Admins (mock API or backend)
//   useEffect(() => {
//     const fetchAdmins = async () => {
//       try {
//          let organizationId = user ? user.organizationId : null;
//         const res = await axios.get(`${URL}/api/admins/${organizationId}`); // replace with real API
//         setAdmins(res.data);
//       } catch (error) {
//         console.error("Error fetching admins", error);
//       }
//     };
//     fetchAdmins();
//   }, []);
   
//       useEffect(() => {
//   const fetchAdmins = async () => {
//     try {
//       let organizationId = user ? user.organizationId : null;
//       const res = await axios.get(`${URL}/api/v1/admins/${organizationId}`,branchHeaders());

// -     setAdmins(res.data);
// +     setAdmins(res.data?.data || []);  // ✅ Extract the array safely
//     } catch (error) {
//       console.error("Error fetching admins", error);
//     }
//   };
//   fetchAdmins();
// }, []);




  const handleAdminChange = (id) => {
    setSelectedAdmin(id);
    setValue("branchAdmins", id, { shouldValidate: true });
  };

  const filteredAdmins = admins.filter((a) =>
    a.fullName.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  const onSubmit = async (data) => {
    try {
      let organizationId = user ? user.organizationId : null;
      const payload = { ...data };
    //   console.log(data);
        if (!organizationId) {
            throw new Error("Organization ID is missing");
        }
// return
      await axios.post(`${URL}/api/branches/create/${organizationId}`, payload,branchHeaders());
      alert("Branch created successfully!");
      reset();
      setSelectedAdmin("");
    } catch (error) {
      console.error(error);
      alert("Error creating branch");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl p-6 mx-auto space-y-6 bg-white shadow-lg rounded-xl"
    >
      <h2 className="text-xl font-bold text-gray-700">Create Branch</h2>

      {/* Branch Name */}
      <div className="relative">
        <input
          {...register("branchName")}
          placeholder=" "
          className={`peer w-full border rounded-lg px-3 pt-5 pb-2 focus:outline-none ${
            errors.branchName ? "border-red-500" : "border-gray-300"
          }`}
        />
        <label className="absolute text-sm text-gray-500 transition-all left-3 top-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
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
        <label className="absolute text-sm text-gray-500 transition-all left-3 top-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
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
        <label className="absolute text-sm text-gray-500 transition-all left-3 top-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
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
        <label className="absolute text-sm text-gray-500 transition-all left-3 top-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
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
        <label className="absolute text-sm text-gray-500 transition-all left-3 top-[-5] peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
          Address
        </label>
        {errors.address?.address && (
          <p className="text-sm text-red-500">{errors.address.address.message}</p>
        )}
      </div>

      {/* Branch Admin Dropdown */}
      {/* <div className="relative h-auto">
       
        <label
          className={`absolute left-3 px-1 transition-all duration-200 pointer-events-none ${
            selectedAdmin 
              ? "text-transparent bg-transparent "
              : "top-5  text-base text-gray-500"
          }`}
        >
          Select Branch Admin
        </label>



      <button
  type="button"
  onClick={() => setIsAdminOpen((prev) => !prev)}
  className={`w-full h-14 px-3 overflow-auto pt-4 text-left text-sm rounded-lg border-2 ${
    selectedAdmin || isAdminOpen
      ? "border border-blue-600"
      : "border border-gray-300 text-gray-700"
  }`}
>
 {admins.find((a) => a._id === selectedAdmin)?.fullName ||"  "}

</button>

        {errors.branchAdmins && (
          <p className="mt-1 text-sm text-red-500">
            {errors.branchAdmins.message}
          </p>
        )}

        {isAdminOpen && (
          <div className="sticky z-50 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg ">
            <input
              type="text"
              placeholder="Search Branch Admin"
              className="w-full p-3 text-sm border-b border-gray-200"
              value={searchAdmin}
              onChange={(e) => setSearchAdmin(e.target.value)}
            />
      <div className="relative space-y-2 overflow-auto bg-gray-100 h-28">

            <div className="overflow-auto overflow-y-auto h-34">
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <button
                    key={admin._id}
                    type="button"
                    onClick={() => {
                      handleAdminChange(admin._id);
                      setIsAdminOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-700 hover:text-white"
                  >
                    {admin.fullName}
                  </button>
                ))
              ) : (
                <p className="p-4 text-gray-500">No results found</p>
              )}    
            </div>
          </div>
          </div>
        )}
      </div> */}

      <button
        type="submit"
        className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Create Branch
      </button>
    </form>
  );
};

export default BranchCreate;
