import { initFlowbite } from "flowbite";
import React, { useState, useEffect, useRef } from "react";
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
  FaSitemap,
  FaUsersCog,
  FaExchangeAlt,   // 🔁 for switch button
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

  // 👇 NEW: track if owner is in admin mode
  const [adminMode, setAdminMode] = useState(false);

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

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
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
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 w-64 h-full min-h-screen bg-blue-600 transition-transform duration-300 transform ${
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
            {/* --- OWNER MENU --- */}
            {role === "owner" && !adminMode && (
              <>
                <li>
                  <Link
                    to="/owner/dashboard"
                    onClick={handleLinkClick}
                    className={`${isActive("/owner/dashboard")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaTachometerAlt className="text-xl" />
                    <span className="ms-4">Owner Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/owner/branches"
                    onClick={handleLinkClick}
                    className={`${isActive("/owner/branches")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaSitemap className="text-xl" />
                    <span className="ms-4">Branch</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/owner/branch-admin"
                    onClick={handleLinkClick}
                    className={`${isActive("/owner/branch-admin")} flex items-center p-2 rounded-lg group`}
                  >
                    <FaUsersCog className="text-xl" />
                    <span className="ms-4">Branch Admins</span>
                  </Link>
                </li>

                {/* 🔁 Switch to Admin Mode */}
                <li>
                  <button
                    onClick={() => setAdminMode(true)}
                    className="flex items-center w-full p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-700"
                  >
                    <FaExchangeAlt className="text-xl" />
                    <span className="ms-4">Switch to Admin</span>
                  </button>
                </li>
              </>
            )}

            {/* --- ADMIN MENU (for admin role OR owner in adminMode) --- */}
            {(role === "admin" || (role === "owner" && adminMode)) && (
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
                {/* ... (rest of your admin links) ... */}

                {/* 🔁 Switch back to Owner Mode (only for owners) */}
                {role === "owner" && (
                  <li>
                    <button
                      onClick={() => setAdminMode(false)}
                      className="flex items-center w-full p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-700"
                    >
                      <FaExchangeAlt className="text-xl" />
                      <span className="ms-4">Switch to Owner</span>
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </aside>
    </>
  );
}

export default NewSidebar;
