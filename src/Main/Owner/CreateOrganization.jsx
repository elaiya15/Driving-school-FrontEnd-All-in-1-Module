import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App"; // renamed to avoid conflict with window.URL

const CreateOrganization = () => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(6);

  const [logoPreview, setLogoPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const navigate = useNavigate();



  console.log('step:', step)
  console.log('completedSteps:', completedSteps)
  // ✅ Step-wise validation schemas
  const schemas = [
    Yup.object({
      organizationName: Yup.string().required("Organization Name is required"),
      organizationEmail: Yup.string().email("Invalid email").required("Email is required"),
      organizationMobileNumber: Yup.string().required("Mobile Number is required"),
      organizationAddress: Yup.object({
        state: Yup.string().required("State is required"),
        city: Yup.string().required("City is required"),
        pincode: Yup.string().required("Pincode is required"),
        address: Yup.string().required("Address is required"),
      }),
      logo: Yup.mixed()
        .required("Organization Logo is required")
        .test("fileType", "Only image files are allowed", (file) => !file || (file && file[0]?.type?.startsWith("image/"))),
    }),
    Yup.object({
      ownerName: Yup.string().required("Owner Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      mobileNumber: Yup.string().required("Mobile Number is required"),
      AlternativeNumber: Yup.string(),
      address: Yup.string().required("Address is required"),
      photo: Yup.mixed()
        .required("Owner Photo is required")
        .test("fileType", "Only image files are allowed", (file) => !file || (file && file[0]?.type?.startsWith("image/"))),
    }),
    Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().required("Password is required"),
    }),
  ];

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    resolver: yupResolver(schemas[step - 1]),
    defaultValues: { organizationAddress: { state: "", city: "", pincode: "", address: "" } },
  });

  // Watch files for preview
  const logoFile = watch("logo");
  const photoFile = watch("photo");

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      setLogoPreview(window.URL.createObjectURL(logoFile[0]));
    }
  }, [logoFile]);

  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      setPhotoPreview(window.URL.createObjectURL(photoFile[0]));
    }
  }, [photoFile]);

  const validateStep = async (stepNumber) => {
    const valid = await trigger();
    if (valid) {
      setCompletedSteps((prev) => (prev.includes(stepNumber) ? prev : [...prev, stepNumber]));
      return true;
    }
    return false;
  };

  const nextStep = async () => {
    const valid = await validateStep(step);
    if (valid && step < 3) setStep((s) => s + 1);
  };


  const prevStep = () => {
    if (step !== 4) setStep((s) => s - 1);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const formData = new FormData();

      // Append text and file fields
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof FileList) {
          formData.append(key, value[0]);
        } else if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formData.append(`${key}[${subKey}]`, subValue);
          });
        } else {
          formData.append(key, value);
        }
      });

      const res = await axios.post(`${URL}/api/v1/organization`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCompletedSteps([1, 2, 3]);
      setSuccessMsg(res.data.message || "Account created successfully");
      setStep(4);
    //   setTimeout(() => navigate("/"), 6000);
      setCountdown(6);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (step === 4 && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }else if (step === 4 && countdown === 0) {
        navigate("/");
      }
  }, [step, countdown,navigate]);

      const progressPercent = ((6 - countdown) / 5) * 100;
   const renderStepTicks = () => (
    <div className="relative flex items-center justify-between mb-6">
      {[1, 2, 3, 4].map((s, idx) => (
        <div key={s} className="flex flex-col items-center flex-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 
              ${completedSteps.includes(s) || (s === 4 && step === 4)
                ? "border-blue-600 bg-blue-600"
                : "border-gray-300 bg-white"}`}
          >
            {completedSteps.includes(s) || (s === 4 && step === 4) ? (
              <i className="text-white fa-solid fa-check"></i>
            ) : (
              <span className="text-gray-600">{s}</span>
            )}
          </div>
          {idx < 3 && (
            <div
              className={`absolute top-4 h-1 w-full left-0 transition-colors duration-300
               ${completedSteps.length > idx ? "bg-blue-600" : "bg-gray-300"}`}
              style={{ width: `${(idx + 1) * 33.3}%` }}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white rounded shadow">
      <h2 className="mb-4 text-2xl font-bold">Create Organization with Owner</h2>
{renderStepTicks()}
      {errorMsg && <div className="mb-3 text-red-600">{errorMsg}</div>}
      {successMsg && step !== 4 && <div className="mb-3 text-blue-600">{successMsg}</div>}

      {step < 4 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label>Organization Name</label>
                <input {...register("organizationName")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.organizationName?.message}</p>
              </div>
              <div>
                <label>Email</label>
                <input {...register("organizationEmail")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.organizationEmail?.message}</p>
              </div>
              <div>
                <label>Mobile Number</label>
                <input {...register("organizationMobileNumber")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.organizationMobileNumber?.message}</p>
              </div>
              <div>
                <label>State</label>
                <input {...register("organizationAddress.state")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.organizationAddress?.state?.message}</p>
              </div>
              <div>
                <label>City</label>
                <input {...register("organizationAddress.city")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.organizationAddress?.city?.message}</p>
              </div>
              <div>
                <label>Pincode</label>
                <input {...register("organizationAddress.pincode")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.organizationAddress?.pincode?.message}</p>
              </div>
              <div>
                <label>Address</label>
                <input {...register("organizationAddress.address")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.organizationAddress?.address?.message}</p>
              </div>

              <div>
                <label>Organization Logo</label>
                <input type="file" accept="image/*" {...register("logo")} className="w-full p-2 border rounded" />
                {logoPreview && <img src={logoPreview} className="w-32 h-32 mt-2 border rounded" />}
                <p className="text-red-500">{errors.logo?.message}</p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label>Owner Name</label>
                <input {...register("ownerName")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.ownerName?.message}</p>
              </div>
              <div>
                <label>Email</label>
                <input {...register("email")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.email?.message}</p>
              </div>
              <div>
                <label>Mobile Number</label>
                <input {...register("mobileNumber")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.mobileNumber?.message}</p>
              </div>
              <div>
                <label>Alternative Number</label>
                <input {...register("AlternativeNumber")} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label>Address</label>
                <input {...register("address")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.address?.message}</p>
              </div>

              <div>
                <label>Owner Photo</label>
                <input type="file" accept="image/*" {...register("photo")} className="w-full p-2 border rounded" />
                {photoPreview && <img src={photoPreview} className="w-32 h-32 mt-2 border rounded" />}
                <p className="text-red-500">{errors.photo?.message}</p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label>Username</label>
                <input {...register("username")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.username?.message}</p>
              </div>
              <div>
                <label>Password</label>
                <input type={showPassword ? "text" : "password"} {...register("password")} className="w-full p-2 border rounded" />
                <p className="text-red-500">{errors.password?.message}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-200 rounded">Back</button>}
            {step < 3 && <button type="button" onClick={nextStep} className="px-4 py-2 text-white bg-blue-600 rounded">Next</button>}
            {step === 3 && <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 rounded">{loading ? "Creating..." : "Create Organization"}</button>}
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">{successMsg}</p>
          <p>Redirecting in {countdown} seconds...</p>
           <div className="w-full h-2 mt-2 overflow-hidden bg-gray-300 rounded">
            <div
              className="h-2 transition-all duration-1000 bg-blue-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
            <button onClick={() => navigate("/login")} className="px-4 py-2 mt-4 text-white bg-blue-600 rounded">Go to Login Now</button>
          
        </div>

        
      )}
    </div>
  );
};

export default CreateOrganization;
