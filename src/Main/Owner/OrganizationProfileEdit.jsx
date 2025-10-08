import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { URL } from "../../App.jsx";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import branchHeaders from "../../Components/utils/headers.jsx";

// ✅ Validation Schema
const schema = yup.object().shape({
  organizationName: yup.string().required("Organization Name is required"),
  organizationEmail: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  organizationMobileNumber: yup
    .string()
    .required("Mobile Number is required")
    .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits"),
  organizationAddress: yup.object().shape({
    state: yup.string().required("State is required"),
    city: yup.string().required("City is required"),
    pincode: yup
      .string()
      .required("Pincode is required")
      .matches(/^[0-9]{6}$/, "Pincode must be 6 digits"),
    address: yup.string().required("Address is required"),
  }),
  logo: yup.mixed().test("logo-required", "Logo is required", function (value) {
    // Check either a File exists OR logoPreview exists
    const { logoPreview } = this.options.context || {};
    return value instanceof File || Boolean(logoPreview);
  }),
});
const OrganizationProfileEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearAuthState } = useRole();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { logoPreview },
  });

  // ✅ Fetch existing organization data
  const fetchOrganization = async () => {
    try {
      const res = await axios.get(
        `${URL}/api/v1/organization/getSingleOrganization/${id}`,
        branchHeaders()
      );
      const data = res.data;
      reset({
        organizationName: data.organizationName || "",
        organizationEmail: data.organizationEmail || "",
        organizationMobileNumber: data.organizationMobileNumber || "",
        organizationAddress: {
          state: data.organizationAddress?.state || "",
          city: data.organizationAddress?.city || "",
          pincode: data.organizationAddress?.pincode || "",
          address: data.organizationAddress?.address || "",
        },
        logo: data.logo || null, // keep null, validation uses logoPreview
      });
      setLogoPreview(
        data.logo
          ? extractDriveFileId(data.logo)
            ? `${URL}/api/image-proxy/${extractDriveFileId(data.logo)}`
            : data.logo
          : null
      );
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

  useEffect(() => {
    fetchOrganization();
  }, [id]);

  // ✅ Submit form
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("organizationName", data.organizationName);
    formData.append("organizationEmail", data.organizationEmail);
    formData.append("organizationMobileNumber", data.organizationMobileNumber);
    formData.append(
      "organizationAddress[state]",
      data.organizationAddress.state
    );
    formData.append("organizationAddress[city]", data.organizationAddress.city);
    formData.append(
      "organizationAddress[pincode]",
      data.organizationAddress.pincode
    );
    formData.append(
      "organizationAddress[address]",
      data.organizationAddress.address
    );
    if (data.logo) {
      formData.append("logo", data.logo); // ✅ logo is now properly sent
    }

    setSubmitLoading(true);
    try {
      await axios.put(
        `${URL}/api/v1/organization/updateOrganization/${id}`,
        formData,
        branchHeaders()
      );
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1200);
    } catch (error) {
      const errMsg =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        error.message;

      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message ===
          "Credential Invalid or Expired Please Login Again"
      ) {
        return setTimeout(() => clearAuthState(), 2000);
      }

      const messages = Array.isArray(errMsg) ? errMsg : [errMsg];
      messages.forEach((msg, i) => {
        setTimeout(() => {
          const toast = document.createElement("div");
          toast.textContent = msg;
          toast.className =
            "fixed z-50 px-4 py-2 text-white bg-red-600 rounded-md shadow-md top-20 right-5";
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 4000);
        }, i * 100);
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ✅ Logo change handler
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("logo", file, { shouldValidate: true }); // only setValue
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setValue("logo", null, { shouldValidate: true });
    setLogoPreview(null);
  };

  if (loading)
    return (
      <p className="py-4 text-center text-blue-600">Loading Organization...</p>
    );

  return (
    <div className="p-4">
      <h2 className="mb-6 text-2xl font-semibold">Edit Organization</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Organization Name */}
        <div>
          <label>Organization Name</label>
          <input
            {...register("organizationName")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500">{errors.organizationName?.message}</p>
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            {...register("organizationEmail")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500">{errors.organizationEmail?.message}</p>
        </div>

        {/* Mobile Number */}
        <div>
          <label>Mobile Number</label>
          <input
            {...register("organizationMobileNumber")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500">
            {errors.organizationMobileNumber?.message}
          </p>
        </div>

        {/* Address Fields */}
        <div>
          <label>State</label>
          <input
            {...register("organizationAddress.state")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500">
            {errors.organizationAddress?.state?.message}
          </p>
        </div>

        <div>
          <label>City</label>
          <input
            {...register("organizationAddress.city")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500">
            {errors.organizationAddress?.city?.message}
          </p>
        </div>

        <div>
          <label>Pincode</label>
          <input
            {...register("organizationAddress.pincode")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500">
            {errors.organizationAddress?.pincode?.message}
          </p>
        </div>

        <div>
          <label>Address</label>
          <input
            {...register("organizationAddress.address")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500">
            {errors.organizationAddress?.address?.message}
          </p>
        </div>

        {/* Logo Upload */}
        <div>
          <label>Organization Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange} // ✅ remove register
            className="w-full p-2 border rounded"
          />
          {logoPreview && (
            <div className="mt-2">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="object-cover w-32 h-32 border rounded"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="block mt-2 text-sm text-red-500"
              >
                Remove
              </button>
            </div>
          )}
          <p className="text-red-500">{errors.logo?.message}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800"
          >
            {submitLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed z-50 px-4 py-2 text-white bg-blue-600 rounded-md shadow-md top-20 right-5">
          Organization updated successfully
        </div>
      )}
    </div>
  );
};

export default OrganizationProfileEdit;
