import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { URL } from "../App";
import logo from "../assets/logo.png";
import { initFlowbite } from "flowbite";
import { extractDriveFileId } from "../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "./AuthContext/AuthContext";
import { FaChevronDown, FaChevronUp, FaSignOutAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import {
  removeBranchSession,
  getBranchSession,
} from "./utils/BranchCookie.jsx";
import userSwitch from "../assets/userswitch.png";

function Navbar({ setSidebarOpen, sidebarOpen }) {
  const { role, user, clearAuthState } = useRole();

  const navigate = useNavigate();
  const [img, setImg] = useState(null);
  const [isLogin, setIsLogin] = useState({
    Name: null,
    photo: null,
    role: role || null,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [switchOwner, setSwitchOwner] = useState(false);
  const branchId = getBranchSession();

  const dropdownRef = useRef(null);

  useEffect(() => {
    initFlowbite();

    if (!role) {
      navigate("/");
    } else {
      setIsLogin(user);
    }
  }, [role]);

  //   console.log('role:', role)
  //   console.log(getBranchSession());

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    clearAuthState();
  };
  const SwitchRole = () => {
    //   const branchId = getBranchSession()
    removeBranchSession();
    navigate("/owner/dashboard", { replace: true }); // no forward to admin
    console.log(branchId);
    console.log(role);
  };

  const handleMyProfile = () => {
    console.log("branchId",branchId);

    console.log(
      "Navigating to profile for role:",
      role,
      "and user ID:",
      user?.user_id
    );
    if (!user?.user_id) return; // Safety check if user is not available

    switch (role) {
      case "learner":
        navigate(`/learner/profile/${user?.user_id}/view`);
        break;
      case "admin":
        navigate(`/admin/profile/${branchId}/${user?.user_id}/view`);
        break;
      case "owner":
        navigate(`/owner/profile/${user?.user_id}/view`);
        break;
      case "instructor":
        navigate(`/instructor/profile/${user?.user_id}/view`);
        break;
      default:
        console.warn("Unknown role:", role);
        // optionally redirect to a fallback
        navigate("/");
        break;
    }
  };

  return (
    <React.Fragment>
      <nav className="fixed top-0 z-50 flex flex-col justify-center w-full h-20 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              {/* ✅ Sidebar open toggle (mobile) */}
              {!sidebarOpen ? (
                <button
                  onClick={() => {
                    if (!sidebarOpen) setSidebarOpen(true);
                  }}
                  //  disabled={sidebarOpen}
                  type="button"
                  className="inline-flex items-center p-2 text-sm text-gray-800 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                    />
                  </svg>
                </button>
              ) : (
                <div className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                    />
                  </svg>
                </div>
              )}

              <div className="flex items-center gap-2 ms-2 mt-1 overflow-hidden max-w-[60vw] sm:max-w-none">
                <img
                  src={logo}
                  className="w-6 sm:w-8 md:w-10 shrink-0"
                  alt="logo"
                />
                <h1 className="text-sm font-extrabold text-center text-blue-600 sm:text-lg md:text-2xl dark:text-white sm:text-left">
                  Ganesh Driving School
                </h1>
              </div>
            </div>

            {/* Profile + Dropdown */}
            <div ref={dropdownRef} className="relative flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-4 text-sm rounded-full focus:outline-none"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {isLogin.photo ? (
                  <img
                    src={
                      isLogin.photo
                        ? `${URL}/api/image-proxy/${extractDriveFileId(
                            isLogin.photo
                          )}`
                        : ""
                    }
                    className="object-cover w-10 h-10 rounded-full shadow-sm cursor-pointer ring-2 ring-blue-500"
                    alt="user"
                    onLoad={(e) => setImg(e.target.src)}
                    onClick={(e) => {
                      e.stopPropagation(); // don’t toggle dropdown
                      setShowImagePreview(true);
                    }}
                  />
                ) : (
                  <FaUser className="object-cover w-10 h-10 py-2 text-blue-600 rounded-full shadow-sm cursor-pointer ring-2 ring-blue-500" />
                )}

                {dropdownOpen ? (
                  <FaChevronUp className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <FaChevronDown className="text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <div className="hidden px-1 sm:block" role="none">
                {/* <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">
                 {isLogin?.Name }
               </p> */}
              </div>

              {dropdownOpen && (
                <div className="absolute top-0 right-0 z-10 w-48 bg-white rounded-md shadow-lg mt-14 dark:bg-gray-700">
                  <div className="py-2 ">
                    <div className="px-4 py-1 text-sm font-medium text-gray-900 truncate dark:text-gray-300">
                      {isLogin?.Name}
                      {/* <div className="block text-sm text-gray-500 truncate divide-y divide-gray-100 dark:divide-gray-600 dark:text-gray-400"> {isLogin?.role}</div> */}
                    </div>
                    <div className="gap-2 px-4 text-sm text-gray-600 dark:text-gray-200 ">
                      {" "}
                      {isLogin?.role}
                    </div>
                  </div>

                  {branchId && role === "owner" && (
                    <div
                      className="flex items-center justify-start gap-2 px-2 py-1 text-sm text-gray-700 border-t border-gray-300 dark:text-gray-200 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-600"
                      onClick={() => {
                        setDropdownOpen(false);
                        setSwitchOwner(true);
                      }}
                    >
                      <img className="w-7 h-7" src={userSwitch} />
                      <span className="text-center"> Switch to Owner </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleMyProfile();
                      setDropdownOpen(false); 
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-800 border-t border-gray-300 test-bold gap-x-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-red-400"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 border-t border-gray-300 gap-x-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-red-400"
                  >
                    <FaSignOutAlt className="text-lg" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-200"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-800 dark:text-gray-400">
                Are you sure you want to{" "}
                <span className="font-semibold">Log out?</span>
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className=" w-20 py-2.5 px-5 text-sm font-medium text-blue-600 bg-white rounded-lg border border-blue-600 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 w-20"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Image Preview Modal */}
      {showImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          onClick={() => setShowImagePreview(false)}
        >
          <div
            className="max-w-full max-h-full p-4 bg-white rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={img}
              alt="Preview"
              className="w-[300px] h-[400px] object-cover rounded-lg"
            />
            <div className="mt-3 text-center">
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowImagePreview(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Switch to Owner Modal */}
      {switchOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-200"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-800 dark:text-gray-400">
                Are you sure you want to{" "}
                <span className="font-semibold">switch to Owner?</span>
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setSwitchOwner(false)}
                  className="w-20 py-2.5 px-5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-blue-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-blue-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    setSwitchOwner(false);
                    SwitchRole();
                  }}
                  className="text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 w-20"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default Navbar;
