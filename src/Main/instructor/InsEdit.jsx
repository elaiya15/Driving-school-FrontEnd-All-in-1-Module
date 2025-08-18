import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { URL as BURL } from "../../App";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required."),
  fathersName: yup.string().required("Father's Name is required."),
  mobileNumber: yup
    .string()
    .required("Mobile Number is required.")
    .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits."),
  dateOfBirth: yup.string().required("Date of Birth is required."),
  gender: yup.string().required("Gender is required."),
  bloodGroup: yup.string().required("Blood Group is required."),
  address: yup.string().required("Address is required."),
  username: yup.string().required("Username is required."),
  password: yup.string().required("Password is required."),
  photo: yup
    .mixed()
    .test("photo-required", "Photo is required.", function (value) {
      const { preview } = this.options.context || {};
      return value instanceof File || Boolean(preview);
    }),
});

const InsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearAuthState } = useRole();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { preview },
  });

  const fetchInstructor = async () => {
    try {
      const { data } = await axios.get(`${BURL}/api/user/instructor/${id}`, {
        withCredentials: true,
      });

      const userData = {
        fullName: data.fullName || "",
        fathersName: data.fathersName || "",
        mobileNumber: data.mobileNumber || "",
        dateOfBirth: data.dateOfBirth?.split("T")[0] || "",
        gender: data.gender || "",
        bloodGroup: data.bloodGroup || "",
        address: data.address || "",
        username: data.userId?.username || "",
        password: data.userId?.password || "",
        photo: data.photo||null,
      };

      reset(userData);

      if (data.photo) {
        const driveId = extractDriveFileId(data.photo);
        const photoUrl = driveId ? `${BURL}/api/image-proxy/${driveId}` : `${data.photo}?t=${Date.now()}`;
        setPreview(photoUrl);
      }
    } catch (err) {
      if (
        err?.response?.status === 401 ||
        err?.response?.data?.message === "Credential Invalid or Expired Please Login Again"
      ) {
        setTimeout(() => clearAuthState(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, [id]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key !== "photo") formData.append(key, data[key]);
    });
    if (data.photo instanceof File) formData.append("photo", data.photo);

    setSubmitLoading(true);
    try {
      await axios.put(`${BURL}/api/user/instructor/${id}`, formData, {
        withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      const err =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        error.message;

      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message === "Credential Invalid or Expired Please Login Again"
      ) {
        return setTimeout(() => clearAuthState(), 2000);
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
      setSubmitLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("photo", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setValue("photo", null, { shouldValidate: true });
    setPreview(null);
  };

  if (loading) return <p className="text-center py-4 text-blue-600">Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Update Instructor</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
          {["fullName", "fathersName", "mobileNumber", "dateOfBirth"].map((id) => (
            <div className="relative" key={id}>
              <input
                type={id === "dateOfBirth" ? "date" : "text"}
                {...register(id)}
                placeholder=" "
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
              />
              <label htmlFor={id} className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                {id === "fathersName" ? "Father's Name" : id.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
              </label>
              {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id].message}</p>}
            </div>
          ))}

          {["gender", "bloodGroup"].map((id) => (
            <div className="relative" key={id}>
              <select
                {...register(id)}
                defaultValue=""
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
              >
                <option value="" disabled hidden>
                  Select {id.charAt(0).toUpperCase() + id.slice(1)}
                </option>
                {(id === "gender"
                  ? ["Male", "Female", "Other"]
                  : ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <label htmlFor={id} className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                {id === "bloodGroup" ? "Blood Group" : "Gender"}
              </label>
              {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id].message}</p>}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            {...register("address")}
            className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md resize-none h-36 focus:outline-none focus:ring-0 focus:border-blue-500"
            placeholder=" "
          ></textarea>
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          <label htmlFor="photo" className="flex items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer relative overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
              </div>
            )}
            <input
              id="photo"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
          {preview && (
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm">{typeof preview === "string" ? "Photo preview" : preview.name}</p>
              <button type="button" onClick={removeFile} className="text-red-500 text-sm">Remove</button>
            </div>
          )}
          {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
          {["username", "password"].map((id) => (
            <div className="relative" key={id}>
              <input
                type={id === "password" ? "password" : "text"}
                {...register(id)}
                placeholder=" "
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
              />
              <label htmlFor={id} className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </label>
              {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id].message}</p>}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800">Back</button>
          <button type="submit" disabled={submitLoading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800">
            {submitLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md">
          Instructor updated successfully
        </div>
      )}
    </div>
  );
};

export default InsEdit;
