import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from "../../Components/AuthContext/AuthContext";

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required."),
  fathersName: yup.string().required("Father's Name is required."),
  mobileNumber: yup
    .string()
    .required("Mobile Number is required.")
    .matches(/^\d{10}$/, "Mobile Number must be exactly 10 digits."),
  dateOfBirth: yup.string().required("Date of Birth is required."),
  gender: yup.string().required("Gender is required."),
  bloodGroup: yup.string().required("Blood Group is required."),
  address: yup.string().required("Address is required."),
  // username: yup.string().required("Username is required."),
  // password: yup.string().required("Password is required."),
  photo: yup.mixed().required("Photo is required."),
});

const NewStaffr = () => {
  const navigate = useNavigate();
  const { clearAuthState } = useRole();
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const formData = new FormData();
    for (let key in data) {
      formData.append(key, data[key]);
    }
    // formData.append("role", "Instructor");

    setLoading(true);
    try {
      await axios.post(`${URL}/api/admin/staff/create`, formData, {
        withCredentials: true,
      });
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        reset();
        setPhoto(null);
        setPreview(null);
        navigate(-1);
      }, 1000);
    } catch (error) {
      const err =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        error.message;
      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message ===
          "Credential Invalid or Expired Please Login Again"
      ) {
        return setTimeout(() => {
          clearAuthState();
        }, 2000);
      }

      const messages = Array.isArray(err) ? err : [err];
      messages.forEach((msg, i) => {
        setTimeout(() => {
          const toast = document.createElement("div");
          toast.textContent = msg;
          toast.className =
            "fixed top-20 right-5 z-50 bg-red-600 text-white px-4 py-2 rounded-md shadow-md";
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 4000);
        }, i * 100);
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreview(reader.result);
        setPhoto(file);
        setValue("photo", file, { shouldValidate: true });
      };
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
    setValue("photo", null, { shouldValidate: true });
  };
  return (
    <div className="p-4">
      <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">Staff Registration</h2>
      <h5 className="sm:text-2xl md:text-xl font-normal mb-4">Personal Details</h5>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
          {[
            { id: 'fullName', label: 'Full Name' },
            { id: 'fathersName', label: "Father's Name" },
            { id: 'mobileNumber', label: 'Mobile Number', maxLength: 10 },
            { id: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
          ].map(({ id, label, maxLength, type = 'text' }) => (
            <div className="relative" key={id}>
              <input
                type={type}
                id={id}
                maxLength={maxLength}
                placeholder=" "
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                {...register(id)}
              />
              <label
                htmlFor={id}
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                {label}
              </label>
              {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id].message}</p>}
            </div>
          ))}

          {[
            { id: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other'] },
            { id: 'bloodGroup', label: 'Blood Group', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
          ].map(({ id, label, options }) => (
            <div className="relative" key={id}>
              <select
                id={id}
                defaultValue=""
                {...register(id)}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
              >
                <option value="" disabled hidden>
                  Select {label}
                </option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <label
                htmlFor={id}
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                {label}
              </label>
              {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id].message}</p>}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row  my-4 gap-x-5">
          <div className="relative mt-5 w-full  bg-">
            <textarea
              id="address"
              {...register('address')}
              placeholder=" "
              className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md resize-none h-36 focus:outline-none focus:ring-0 focus:border-blue-500"
            />
            <label
              htmlFor="address"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:-translate-y-1 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Address
            </label>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols w-full ">
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <label htmlFor="photo" className={`flex items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer ${!preview ? "dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" : ""} dark:border-gray-600 dark:hover:border-gray-500 relative overflow-hidden`}>
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6A5.5 5.5 0 0 0 5 5a4 4 0 0 0 0 8h2M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> </p>
                </div>
              )}
              <input
                id="photo"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*"
              />
            </label>
            {photo && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">{photo.name}</p>
                <button type="button" onClick={removePhoto} className="text-red-500 text-sm">Remove</button>
              </div>
            )}
            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>}
          </div>
        </div>

        {/* <div className="mt-8">
          <h5 className="sm:text-2xl md:text-xl font-normal mb-4">Login Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
            {[{ id: 'username', label: 'Username' }, { id: 'password', label: 'Password', type: 'password' }].map(({ id, label, type = 'text' }) => (
              <div className="relative" key={id}>
                <input
                  type={type}
                  id={id}
                  placeholder=" "
                  className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                  {...register(id)}
                />
                <label
                  htmlFor={id}
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
                >
                  {label}
                </label>
                {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id].message}</p>}
              </div>
            ))}
          </div>
        </div> */}

        <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <button type="button" onClick={() => navigate(-1)} disabled={loading} className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>Back</button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800">
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md">
          Staff created successfully
        </div>
      )}
    </div>
  );
};

export default NewStaffr;
