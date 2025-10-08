
// npm install react-hook-form yup @hookform/resolvers

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
});

export default function YupValidationForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    alert("Submitted: " + JSON.stringify(data));
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 max-w-sm mx-auto space-y-3"
    >
      <input
        {...register("name")}
        placeholder="Name"
        className="border p-2 w-full"
      />
      <p className="text-red-500 text-sm">{errors.name?.message}</p>

      <input
        {...register("email")}
        placeholder="Email"
        className="border p-2 w-full"
      />
      <p className="text-red-500 text-sm">{errors.email?.message}</p>

      <input
        type="password"
        {...register("password")}
        placeholder="Password"
        className="border p-2 w-full"
      />
      <p className="text-red-500 text-sm">{errors.password?.message}</p>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
