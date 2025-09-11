// utils/headers.jsx

// Common reusable branch headers
const branchHeaders = () => {
  const branchId = sessionStorage.getItem("branchId");

  return {
    headers: {
      "x-branch-id": branchId || null, // ✅ safe fallback
    },
    withCredentials: true, // ✅ ensures cookies like GDS_Token go along
  };
};

export default branchHeaders;
