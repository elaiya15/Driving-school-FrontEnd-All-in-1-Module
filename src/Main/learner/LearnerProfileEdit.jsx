import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion";
import { useRole } from "../../Components/AuthContext/AuthContext";
import axios from "axios";
import { URL as BURL } from "../../App";
import branchHeaders from "../../Components/utils/headers";

const schema = yup.object().shape({
  fullName: yup.string().required("Full name is required"),
  fathersName: yup.string().required("Father's name is required"),
  mobileNumber: yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  gender: yup.string().required("Gender is required"),
  bloodGroup: yup.string().required("Blood group is required"),
  address: yup.string().required("Address is required"),
  licenseNumber: yup.string().required("License number is required"),
  llrNumber: yup.string().required("LLR number is required"),
  username: yup.string().required("Username is required"),
//   password: yup.string().required("Password is required"),
});

const inputClass = "peer block w-full appearance-none border border-gray-300 bg-transparent px-2.5 pt-4 pb-2.5 text-sm text-gray-900 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 dark:text-white dark:border-gray-600 dark:focus:border-blue-400";
const labelClass = "absolute start-1 z-10 origin-[0] scale-75 transform -translate-y-4 top-2 bg-white dark:bg-gray-900 px-2 text-sm text-gray-500 dark:text-gray-400 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 peer-focus:dark:text-blue-400";

const LearEdit = () => {
  const { id, admissionNumber } = useParams();
  const { clearAuthState } = useRole();
  const navigate = useNavigate();
  const [filePreviews, setFilePreviews] = useState({});
  const [modalState, setModalState] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register, handleSubmit, setValue, trigger, reset, formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });


  
  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const fetch = await axios.get(`${BURL}/api/v3/learner/${id}`,branchHeaders());
        const data = fetch.data;

        Object.entries(data).forEach(([key, val]) => {
          if (key === "userId") {
            setValue("username", val?.username || "");
            // setValue("password", val?.password || "");
          } else if (key === "dateOfBirth") {
            setValue(key, new Date(val).toISOString().split("T")[0]);
          } else {
            setValue(key, val);
          }
        });

        const fileKeys = ["photo", "signature", "aadharCard", "educationCertificate", "passport", "notary"];
        const fileIdMap = fileKeys.map((key) => ({
          key,
          id: extractDriveFileId(data[key]),
        }));

        const fileIds = fileIdMap.map((f) => f.id);

        const res = await axios.post(
          `${BURL}/api/image-proxy/file-types`,
          { fileIds },
          { withCredentials: true }
        );

        // ✅ Convert results to object instead of array
        const previewObj = {};
        res.data.results.forEach((r, index) => {
          const key = fileIdMap[index].key;
          previewObj[key] = {
            url: `${BURL}/api/image-proxy/${r.fileId}`,
            fileType: r.fileType,
            id: r.fileId,
          };
        });

        setFilePreviews(previewObj);
      } catch (err) {
        console.error("Error loading learner:", err);
      }
    };
    fetchLearner();
  }, [id, setValue]);

  const handleFileChange = async (e, name, onlyImage) => {
    const file = e.target.files[0];
    if (!file) return;
    if (onlyImage && !file.type.startsWith("image/")) {
      setValue(name, null);
      await trigger(name);
      return;
    }
    const url = URL.createObjectURL(file);
    setValue(name, file);
    setFilePreviews(prev => ({ ...prev, [name]: { file, url, fileType: file.type.includes("pdf") ? "pdf" : "image" } }));
    await trigger(name);
  };

  const handleRemoveFile = (name) => {
    setValue(name, null);
    setFilePreviews(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setModalState(prev => ({ ...prev, [name]: false }));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === "string") {
        formData.append(key, value);
      }
    });

    try {
      setLoading(true);
      await axios.put(`${BURL}/api/v2/learner/${admissionNumber}`, formData, { withCredentials: true });
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (err) {
      if (err?.response?.status === 401) return setTimeout(clearAuthState, 2000);
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, label, type = "text") => (
    <div className="relative w-full">
      <input type={type} id={name} placeholder=" " {...register(name)}
        disabled={name === "username"} // 👈 disable username
      className={`${inputClass} ${name === "username" ? "bg-gray-100 cursor-not-allowed" : ""}`} />
      <label htmlFor={name} className={labelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div className="relative w-full">
      <select {...register(name)} className={inputClass}>
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <label className={labelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const renderTextarea = (name, label) => (
    <div className="relative w-full">
      <textarea {...register(name)} placeholder=" " className={`${inputClass} resize-none h-24`} />
      <label className={labelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );
 


const [previewLoading, setPreviewLoading] = useState({}); // 🟡 add this at top
const [confirmRemove, setConfirmRemove] = useState({ open: false, name: "" });

// Inside your component
useEffect(() => {
  if (confirmRemove.open) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }

  // Clean up on unmount
  return () => {
    document.body.classList.remove("overflow-hidden");
  };
}, [confirmRemove.open]);

const renderFileInput = (name, label) => {
  const preview = filePreviews[name];
  const previewUrl = preview?.url || "";
  const fileType = preview?.fileType || "";
  const isPDF = fileType === "pdf" || previewUrl.endsWith(".pdf");
  const isImage = fileType === "image" || previewUrl.startsWith("blob:");
  const isOpen = modalState[name];
  const isLoading = previewLoading[name];

  const acceptType = name === "photo" ? "image/*" : "image/*,.pdf";

  const openModal = () => {
    setModalState((prev) => ({ ...prev, [name]: true }));
    setPreviewLoading((prev) => ({ ...prev, [name]: true }));
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, [name]: false }));
    setPreviewLoading((prev) => ({ ...prev, [name]: false }));
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">{label}</label>

      <label
        htmlFor={name}
        className="flex items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer h-36"
      >
        {previewUrl ? (
          isPDF ? (
            <iframe
              src={previewUrl}
              title={`${name}-pdf-preview`}
              className="w-full h-full border rounded"
            />
          ) : isImage ? (
            <img
              src={previewUrl}
              alt={`${name}-preview`}
              className="object-contain w-full h-full rounded-lg"
            />
          ) : (
            <p className="text-red-500">Unsupported file type</p>
          )
        ) : (
          <span className="text-sm text-gray-400">Click to upload</span>
        )}
        <input
          type="file"
          id={name}
          name={name}
          accept={acceptType}
          className="hidden"
          onChange={(e) => handleFileChange(e, name, name === "photo")}
        />
      </label>

      {previewUrl && (
        <div className="flex justify-between mt-2">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={openModal}
          >
            View
          </button>
         <button
          type="button"
          className="text-sm text-red-600 hover:underline"
          onClick={() => setConfirmRemove({ open: true, name })}
          >
            Remove
          </button>

        </div>
      )}

      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>
      )}

      {/* ✅ Preview Modal */}
      {isOpen && previewUrl && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="relative w-11/12 max-w-2xl p-6 bg-white rounded-lg shadow-xl">

            <button
              className="absolute text-xl font-bold text-red-500 top-2 right-2"
              onClick={closeModal}
            >
              ✕
            </button>

            <div className=" w-full h-[80vh] flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-80">
                  <svg
                    className="w-10 h-10 text-blue-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                </div>
              )}

              {isPDF ? (
                <iframe
                 src={`${previewUrl}?t=${Date.now()}`}
                  title="PDF Full Preview"
                className="w-full h-full border rounded"
                  onLoad={() =>
                    setPreviewLoading((prev) => ({ ...prev, [name]: false }))
                  }
                />
              ) : (
                <img
                src={`${previewUrl}?t=${Date.now()}`}
                  alt="Image Full Preview"
                  className="object-contain max-w-full max-h-full"
                  onLoad={() =>
                    setPreviewLoading((prev) => ({ ...prev, [name]: false }))
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
{confirmRemove.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
    <div className="w-full max-w-sm p-6 text-center bg-white rounded-lg shadow-lg">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Are you sure you want to remove <span className="text-blue-600">{confirmRemove.name}</span>?
      </h3>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            handleRemoveFile(confirmRemove.name);
            setConfirmRemove({ open: false, name: "" });
          }}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Yes, Remove
        </button>
        <button
          onClick={() => setConfirmRemove({ open: false, name: "" })}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};


  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Update Learner</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderInput("fullName", "Full Name")}
          {renderInput("fathersName", "Father's Name")}
          {renderInput("mobileNumber", "Mobile Number")}
          {renderInput("dateOfBirth", "Date of Birth", "date")}
          {renderSelect("gender", "Gender", ["Male", "Female", "Other"])}
          {renderSelect("bloodGroup", "Blood Group", ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])}
          {renderFileInput("photo", "Photo", true)}
          {renderFileInput("signature", "Signature")}
          {renderFileInput("aadharCard", "Aadhar Card")}
          {renderFileInput("educationCertificate", "Education Certificate")}
          {renderFileInput("passport", "Passport")}
          {renderFileInput("notary", "Notary")}
        </div>

        <div className="py-6">
          {renderTextarea("address", "Address")}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderInput("licenseNumber", "License Number")}
          {renderInput("llrNumber", "LLR Number")}
          {renderInput("username", "Username")}
          {/* {renderInput("password", "Password")} */}
        </div>

             <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
          <button
              onClick={() => navigate(-1)}
              disabled={loading}
              type="button"
              className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Back
            </button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800">
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {toastOpen && <div className="fixed px-4 py-2 text-white bg-blue-700 rounded shadow top-20 right-5">Learner updated successfully</div>}
      {errorMsg && <div className="fixed px-4 py-2 text-white bg-red-600 rounded shadow top-32 right-5">{errorMsg}</div>}
    </div>
  );
};

export default LearEdit;
