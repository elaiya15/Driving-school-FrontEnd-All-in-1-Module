import { initFlowbite } from "flowbite";
import React, { useState, useEffect,useRef  } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaChalkboardTeacher,
  FaBook,
  FaFileAlt,
  FaMoneyCheckAlt,
  FaClipboardCheck,
  FaUserShield,
  FaSignOutAlt,
} from "react-icons/fa";
import { useRole } from "./AuthContext/AuthContext";

function NewSidebar({ isOpen, onClose }) {
   const sidebarRef = useRef(null);


  useEffect(() => initFlowbite(), []);
  const { role, isLoading, clearAuthState } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !role) {
      navigate("/", { replace: true });
    }
  }, [isLoading, role, navigate]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin/attendance")) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [location.pathname]);

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
        ? "bg-blue-700 text-white"
        : "text-white dark:hover:bg-blue-800";
    }
    return location.pathname.startsWith(path)
      ? "bg-blue-700 text-white"
      : "text-white dark:hover:bg-blue-800";
  };

  // 👇 Auto-close on mobile click
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if sidebar is open AND click is outside
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        onClose(); // trigger parent close
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);


  if (isLoading || !role) return null;

  return (
    <>
      <aside ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 w-64 h-full min-h-screen   md:min-w-60 lg:min-w-72   bg-blue-600 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <button
          onClick={onClose}
          className="absolute text-xl text-white top-3 right-3 md:hidden"
        >
          ×
        </button>

        <div className="flex flex-col justify-between h-full px-3 pb-5 overflow-y-auto pt-28 dark:bg-blue-800">
          <ul className="space-y-2 font-normal">
            {role === "admin" && (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/dashboard")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaTachometerAlt className="text-xl" />
                    <span className="ms-4">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/learner/list"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/learner")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaUser className="text-xl" />
                    <span className="ms-4">Learner </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/instructor/list"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/instructor")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaChalkboardTeacher className="text-xl" />
                    <span className="ms-4">Instructor</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/staff/list"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/staff")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaUserShield className="text-xl" />
                    <span className="ms-4">Staff</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/Course/list"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/Course")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaBook className="text-xl" />
                    <span className="ms-4">Course</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/course-assigned/list"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/course-assigned")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaClipboardCheck className="text-xl" />
                    <span className="ms-4">Course-Assigned</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setOpen(!open)}
                    className={`${isActive("/admin/attendance")} flex items-center w-full p-2 rounded-lg group`}
                  >
                    <FaClipboardCheck className="text-xl" />
                    <span className="ms-4">Attendance</span>
                    <svg
                      className={`w-3 h-3 ms-auto transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 1l4 4 4-4"
                      />
                    </svg>
                  </button>
                  <ul
                    className={`${
                      open ? "block" : "hidden"
                    } py-2 pl-10 space-y-2`}
                  >
                    <li>
                      <Link
                        to="/admin/attendance/learner/list"
                        onClick={handleLinkClick}
                        className={`${isActive(
                          "/admin/attendance/learner"
                        )} flex items-center p-2 rounded-lg group`}
                      >
                        <FaUser className="text-xl" />
                        <span className="ms-5">Learner</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/attendance/instructor/list"
                        onClick={handleLinkClick}
                        className={`${isActive(
                          "/admin/attendance/instructor"
                        )} flex items-center p-2 rounded-lg group`}
                      >
                        <FaChalkboardTeacher className="text-xl" />
                        <span className="ms-5">Instructor</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/attendance/staff/list"
                        onClick={handleLinkClick}
                        className={`${isActive(
                          "/admin/attendance/staff"
                        )} flex items-center p-2 rounded-lg group`}
                      >
                        <FaUserShield className="text-xl" />
                        <span className="ms-5">Staff</span>
                      </Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link
                    to="/admin/payment/list"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/payment")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaMoneyCheckAlt className="text-xl" />
                    <span className="ms-4">Payment</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/test-details/list"
                    onClick={handleLinkClick}
                    className={`${isActive("/admin/test-details")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaFileAlt className="text-xl" />
                    <span className="ms-4">Test Details</span>
                  </Link>
                </li>
              </>
            )}
             {role === "learner" && (
                  <>
                    
                    <li><Link onClick={handleLinkClick}  to="/learner/LearnerDash" className={`${isActive("/learner/LearnerDash")} flex items-center p-2 rounded-lg group`}><FaTachometerAlt className="text-xl" /><span className="ms-4">Dashboard</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/learner/attendance" className={`${isActive("/learner/attendance")} flex items-center p-2 rounded-lg group`}><FaClipboardCheck className="text-xl" /><span className="ms-4">Attendance</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/learner/payment" className={`${isActive("/learner/payment")} flex items-center p-2 rounded-lg group`}><FaMoneyCheckAlt className="text-xl" /><span className="ms-4">Payment</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/learner/test-details" className={`${isActive("/learner/test-details")} flex items-center p-2 rounded-lg group`}><FaFileAlt className="text-xl" /><span className="ms-4">Test Details</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/learner/Course" className={`${isActive("/learner/Course")} flex items-center p-2 rounded-lg group`}><FaBook className="text-xl" /><span className="ms-4">Course Details</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/learner/profile" className={`${isActive("/learner/profile")} flex items-center p-2 rounded-lg group`}><FaUser className="text-xl" /><span className="ms-4">Profile</span></Link></li>
                  </>
                )}
                {role === "instructor" && (
                  <>
                    <li><Link onClick={handleLinkClick} to="/instructor/instructorDash" className={`${isActive("/instructor/instructorDash")} flex items-center p-2 rounded-lg group`}><FaTachometerAlt className="text-xl" /><span className="ms-4">Dashboard</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/instructor/attendance/list" className={`${isActive("/instructor/attendance")} flex items-center p-2 rounded-lg group`}><FaClipboardCheck className="text-xl" /><span className="ms-4">Attendance</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/instructor/payment/list" className={`${isActive("/instructor/payment")} flex items-center p-2 rounded-lg group`}><FaMoneyCheckAlt className="text-xl" /><span className="ms-4">Payment</span></Link></li>
                    <li><Link onClick={handleLinkClick} to="/instructor/profile" className={`${isActive("/instructor/profile")} flex items-center p-2 rounded-lg group`}><FaUser className="text-xl" /><span className="ms-4">Profile</span></Link></li>
                  </>
                )}
            <li>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center hidden w-full p-2 text-white rounded-lg text-start bg-blue-60 group md:hidden"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="flex-1 ms-5 whitespace-nowrap">Log Out</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* 🔐 Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-200"
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
                  className="py-2.5 px-5 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    clearAuthState();
                  }}
                  className="text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NewSidebar;
