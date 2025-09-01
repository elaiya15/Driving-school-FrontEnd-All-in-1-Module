// utils/setBranchCookie.jsx


export const setBranchSession = (branchId) => {
    
  if (!branchId) return;
  // Set
sessionStorage.setItem("branchId", branchId);

};

// utils/removeBranchCookie.jsx
export const removeBranchSession= () => {
// Remove
sessionStorage.removeItem("branchId");
};

export const getBranchSession = () => {
  const branchId = sessionStorage.getItem("branchId");
  return branchId ? branchId : null;
};
