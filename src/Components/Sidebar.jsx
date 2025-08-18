// import { useState } from "react";
// import { NavLink } from "react-router-dom";

// import {
//   FaTachometerAlt,
//   FaUserCheck,
//   FaChalkboardTeacher,
//   FaBook,
//   FaTasks,
//   FaMoneyCheckAlt,
//   FaFileAlt,
//   FaUser,
//   FaSms,
//   FaUserTie,
//   FaChartBar,
//   FaSignOutAlt,
// } from "react-icons/fa";

// const sidebarOptions = {
//   admin: [
//     { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
//     { name: "Learner", icon: <FaUser />, path: "/dashboard/learner" },
//     {
//       name: "Instructor",
//       icon: <FaChalkboardTeacher />,
//       path: "/dashboard/instructor",
//     },
//     { name: "Course", icon: <FaBook />, path: "/dashboard/course" },
//     {
//       name: "Course Assigned",
//       icon: <FaTasks />,
//       path: "/dashboard/course-assigned",
//     },
//     {
//       name: "Attendance",
//       icon: <FaUserCheck />,
//       subOptions: [
//         {
//           name: "Learner",
//           icon: <FaUser />,
//           path: "/dashboard/attendance/learner",
//         },
//         {
//           name: "Instructor",
//           icon: <FaChalkboardTeacher />,
//           path: "/dashboard/attendance/instructor",
//         },
//         {
//           name: "Staff",
//           icon: <FaUserTie />,
//           path: "/dashboard/attendance/staff",
//         },
//       ],
//     },
//     { name: "Payment", icon: <FaMoneyCheckAlt />, path: "/dashboard/payment" },
//     {
//       name: "Test Details",
//       icon: <FaFileAlt />,
//       path: "/dashboard/test-details",
//     },
//     { name: "SMS Settings", icon: <FaSms />, path: "/dashboard/sms-settings" },
//     { name: "Report", icon: <FaChartBar />, path: "/dashboard/report" },
//     { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
//   ],
//   learner: [
//     { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
//     {
//       name: "Attendance",
//       icon: <FaUserCheck />,
//       path: "/dashboard/attendance",
//     },
//     { name: "Payment", icon: <FaMoneyCheckAlt />, path: "/dashboard/payment" },
//     { name: "Course", icon: <FaBook />, path: "/dashboard/course" },
//     {
//       name: "Test Details",
//       icon: <FaFileAlt />,
//       path: "/dashboard/test-details",
//     },
//     { name: "Profile", icon: <FaUser />, path: "/dashboard/profile" },
//     { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
//   ],
//   instructor: [
//     { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
//     {
//       name: "Attendance",
//       icon: <FaUserCheck />,
//       path: "/dashboard/attendance",
//     },
//     { name: "Payment", icon: <FaMoneyCheckAlt />, path: "/dashboard/payment" },
//     { name: "Profile", icon: <FaUser />, path: "/dashboard/profile" },
//     { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
//   ],
// };
// const Sidebar = ({  onLogout }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
// const role= localStorage.getItem(role)
//   const handleDropdownToggle = (itemName) => {
//     setOpenDropdown(openDropdown === itemName ? null : itemName);
//   };

//   return (
//     <div className="w-64 bg-blue-600 mt-20 text-white h-screen p-4 overflow-y-auto">
//       <ul>
//         {sidebarOptions[role]?.map((item, index) => (
//           <li key={index} className="mb-2">
//             {item.subOptions ? (
//               <div>
//                 <div
//                   className="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-700 rounded"
//                   onClick={() => handleDropdownToggle(item.name)}
//                 >
//                   <div className="flex items-center gap-2">
//                     {item.icon} <span>{item.name}</span>
//                   </div>
//                   <svg
//                     className={`w-3 h-3 shrink-0 transition-transform ${
//                       openDropdown === item.name ? "rotate-180" : ""
//                     }`}
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 10 6"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M9 5 5 1 1 5"
//                     />
//                   </svg>
//                 </div>

//                 {openDropdown === item.name && (
//                   <ul className="ml-6 mt-1 max-h-40 overflow-y-auto">
//                     {item.subOptions.map((subItem, subIndex) => (
//                       <li key={subIndex}>
//                         <NavLink
//                           to={subItem.path}
//                           className={({ isActive }) =>
//                             `flex items-center gap-2 p-2 rounded cursor-pointer ${
//                               isActive ? "bg-blue-800" : "hover:bg-blue-700"
//                             }`
//                           }
//                         >
//                           {subItem.icon} <span>{subItem.name}</span>
//                         </NavLink>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             ) : item.action === "logout" ? (
//               <button
//                 onClick={onLogout}
//                 className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-700 w-full text-left"
//               >
//                 {item.icon} <span>{item.name}</span>
//               </button>
//             ) : (
//               <NavLink
//                 to={item.path}
//                 end
//                 className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-700"
//               >
//                 {item.icon} <span>{item.name}</span>
//               </NavLink>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

// import { useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaUserCheck,
//   FaChalkboardTeacher,
//   FaBook,
//   FaTasks,
//   FaMoneyCheckAlt,
//   FaFileAlt,
//   FaUser,
//   FaSms,
//   FaUserTie,
//   FaChartBar,
//   FaSignOutAlt,
// } from "react-icons/fa";

// const sidebarOptions = {
//   admin: [
//     { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
//     { name: "Learner", icon: <FaUser />, path: "/dashboard/learner" },
//     { name: "Instructor", icon: <FaChalkboardTeacher />, path: "/dashboard/instructor" },
//     { name: "Course", icon: <FaBook />, path: "/dashboard/course" },
//     { name: "Course Assigned", icon: <FaTasks />, path: "/dashboard/course-assigned" },
//     {
//       name: "Attendance",
//       icon: <FaUserCheck />,
//       subOptions: [
//         { name: "Learner", icon: <FaUser />, path: "/dashboard/attendance/learner" },
//         { name: "Instructor", icon: <FaChalkboardTeacher />, path: "/dashboard/attendance/instructor" },
//         { name: "Staff", icon: <FaUserTie />, path: "/dashboard/attendance/staff" },
//       ],
//     },
//     { name: "Payment", icon: <FaMoneyCheckAlt />, path: "/dashboard/payment" },
//     { name: "Test Details", icon: <FaFileAlt />, path: "/dashboard/test-details" },
//     { name: "SMS Settings", icon: <FaSms />, path: "/dashboard/sms-settings" },
//     { name: "Report", icon: <FaChartBar />, path: "/dashboard/report" },
//     { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
//   ],
//   learner: [
//     { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
//     { name: "Attendance", icon: <FaUserCheck />, path: "/dashboard/attendance" },
//     { name: "Payment", icon: <FaMoneyCheckAlt />, path: "/dashboard/payment" },
//     { name: "Course", icon: <FaBook />, path: "/dashboard/course" },
//     { name: "Test Details", icon: <FaFileAlt />, path: "/dashboard/test-details" },
//     { name: "Profile", icon: <FaUser />, path: "/dashboard/profile" },
//     { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
//   ],
//   instructor: [
//     { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
//     { name: "Attendance", icon: <FaUserCheck />, path: "/dashboard/attendance" },
//     { name: "Payment", icon: <FaMoneyCheckAlt />, path: "/dashboard/payment" },
//     { name: "Profile", icon: <FaUser />, path: "/dashboard/profile" },
//     { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
//   ],
// };

// const Sidebar = ({ onLogout }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const role = localStorage.getItem("role") || ""; // ✅ Fix role retrieval

//   const handleDropdownToggle = (itemName) => {
//     setOpenDropdown(openDropdown === itemName ? null : itemName);
//   };

//   if (!role || !sidebarOptions[role]) {
//     return null; // ✅ Prevent rendering if role is missing
//   }

//   return (
//     <div className="w-64 bg-blue-600 mt-20 text-white h-screen p-4 overflow-y-auto">
//       <ul>
//         {sidebarOptions[role].map((item, index) => (
//           <li key={index} className="mb-2">
//             {item.subOptions ? (
//               <div>
//                 <div
//                   className="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-700 rounded"
//                   onClick={() => handleDropdownToggle(item.name)}
//                 >
//                   <div className="flex items-center gap-2">
//                     {item.icon} <span>{item.name}</span>
//                   </div>
//                   <svg
//                     className={`w-3 h-3 shrink-0 transition-transform ${
//                       openDropdown === item.name ? "rotate-180" : ""
//                     }`}
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 10 6"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M9 5 5 1 1 5"
//                     />
//                   </svg>
//                 </div>

//                 {openDropdown === item.name && (
//                   <ul className="ml-6 mt-1 max-h-40 overflow-y-auto">
//                     {item.subOptions.map((subItem, subIndex) => (
//                       <li key={subIndex}>
//                         <NavLink
//                           to={subItem.path}
//                           className={({ isActive }) =>
//                             `flex items-center gap-2 p-2 rounded cursor-pointer ${
//                               isActive ? "bg-blue-800" : "hover:bg-blue-700"
//                             }`
//                           }
//                         >
//                           {subItem.icon} <span>{subItem.name}</span>
//                         </NavLink>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             ) : item.action === "logout" ? (
//               <button
//                 onClick={onLogout}
//                 className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-700 w-full text-left"
//               >
//                 {item.icon} <span>{item.name}</span>
//               </button>
//             ) : (
//               <NavLink
//                 to={item.path}
//                 end
//                 className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-700"
//               >
//                 {item.icon} <span>{item.name}</span>
//               </NavLink>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserCheck,
  FaChalkboardTeacher,
  FaBook,
  FaTasks,
  FaMoneyCheckAlt,
  FaFileAlt,
  FaUser,
  FaSms,
  FaUserTie,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

const sidebarOptions = {
  admin: [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "." },
    { name: "Learner", icon: <FaUser />, path: "/admin/learner" },
    { name: "Instructor", icon: <FaChalkboardTeacher />, path: "/admininstructor" },
    { name: "Course", icon: <FaBook />, path: "/admincourse" },
    { name: "Course Assigned", icon: <FaTasks />, path: "/admin/course-assigned" },
    {
      name: "Attendance",
      icon: <FaUserCheck />,
      subOptions: [
        { name: "Learner", icon: <FaUser />, path: "/admin/attendance/learner" },
        {
          name: "Instructor",
          icon: <FaChalkboardTeacher />,
          path: "/admin/attendance/instructor",
        },
        { name: "Staff", icon: <FaUserTie />, path: "/admin/attendance/staff" },
      ],
    },
    { name: "Payment", icon: <FaMoneyCheckAlt />, path: "/admin/payment" },
    { name: "Test Details", icon: <FaFileAlt />, path: "/admin/test-details" },
    { name: "SMS Settings", icon: <FaSms />, path: "/admin/sms-settings" },
    { name: "Report", icon: <FaChartBar />, path: "/admin/report" },
    { name: "Logout", icon: <FaSignOutAlt />, action: "/admin/logout" },
  ],

  learner: [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "." },
    { name: "Attendance", icon: <FaUserCheck />, path: "attendance/learner" },
    { name: "Payment", icon: <FaMoneyCheckAlt />, path: "payment" },
    { name: "Course", icon: <FaBook />, path: "course" },
    { name: "Test Details", icon: <FaFileAlt />, path: "test-details" },
    { name: "Profile", icon: <FaUser />, path: "profile" },
    { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
  ],
  instructor: [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "." },
    { name: "Attendance", icon: <FaUserCheck />, path: "attendance/learner" },
    { name: "Payment", icon: <FaMoneyCheckAlt />, path: "payment" },
    { name: "Profile", icon: <FaUser />, path: "profile" },
    { name: "Logout", icon: <FaSignOutAlt />, action: "logout" },
  ],
};
const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const role = localStorage.getItem("role") || "";

  const handleDropdownToggle = (itemName) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  if (!role || !sidebarOptions[role]) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50  md:hidden"
          onClick={onClose}
        />
      )}<div
      className={`absolute inset-y-0 left-0 z-40 w-64 mt-20 min-h-screen text-white bg-blue-600 transition-transform duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 flex flex-col`}
    >
      <ul className="flex-1">
        {sidebarOptions[role]
          .filter((item) => item.action !== "logout") 
          .map((item, index) => (
            <li key={index} className="mb-2">
              {item.subOptions ? (
                <div>
                  <div
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-700 rounded"
                    onClick={() => handleDropdownToggle(item.name)}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon} <span>{item.name}</span>
                    </div>
                    {item.subOptions && (
                      <svg
                        data-accordion-icon
                        className={`w-3 h-3 shrink-0 transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5 5 1 1 5"
                        />
                      </svg>
                    )}
                  </div>
    
                  {openDropdown === item.name && (
                    <ul className="ml-6 mt-1 max-h-40 overflow-y-auto">
                      {item.subOptions.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center gap-2 p-2 rounded cursor-pointer ${
                                isActive ? "bg-blue-800" : "hover:bg-blue-700"
                              }`
                            }
                            onClick={onClose}
                          >
                            {subItem.icon} <span>{subItem.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  end
                  className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-700"
                  onClick={onClose}
                >
                  {item.icon} <span>{item.name}</span>
                </NavLink>
              )}
            </li>
          ))}
      </ul>
    
      <div className="p-2">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-700 w-full text-left"
        >
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>
    </div>
    
    </>
  );
};

export default Sidebar;
