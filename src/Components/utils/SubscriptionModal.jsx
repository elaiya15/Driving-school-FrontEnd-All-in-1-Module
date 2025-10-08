// Components/SubscriptionModal.jsx
import React, { useEffect } from "react";
import {useRole} from "../AuthContext/AuthContext";

const SubscriptionModal = ({ message, onClose }) => {
  const { role,clearAuthState, user,setUser, setRole, isLoading } = useRole();

//   useEffect(() => {
//     const timer = setTimeout(onClose, 3000); // Auto-close after 3 seconds
//     return () => clearTimeout(timer);
//   }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-sm text-gray-600">{message}</p>
    
        <button
          onClick={clearAuthState}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Back to login Page
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;
