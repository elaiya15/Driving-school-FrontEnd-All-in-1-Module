// App.js (Modified for Role-Based Routing)
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./login/LoginPage";
import AdminDash from "./Components/AdminDash";
import Dashboard from "./Components/DashBoard";
import InstructorTable from "./Main/instructor/InstructorTable";
import CourseTable from "./Main/course/CourseTable";
import AssignCourseTable from "./Main/courseAssigned/AssignCourseTable";
import StaffAttTable from "./Main/attendance/staff/StaffAttTable";
import LearnerAttTable from "./Main/attendance/learner/LearnerAttTable";
import InsAttTable from "./Main/attendance/instructor/InsAttTable";
import PaymentTable from "./Main/payment/PaymentTable";
import TestTable from "./Main/test/TestTable";
import SmsTable from "./Main/sms/SmsTable";
import LearnerTable from "./Main/learner/LearnerTable";
import LearnerDash from "./Components/LearnerDash";
import InstructorDash from "./Components/InstructorDash";
import LearnerProfile from "./Main/learner/LearnerProfile";
import InstructorProfile from "./Main/instructor/InstructorProfile";
import Instructor from "./Components/Instructor";
import Learner from "./Components/Learner";
import NewRegistration from "./Main/learner/NewRegistration";
import LearnEdit from "./Main/learner/LearnEdit";
import LearnPreview from "./Main/learner/LearnPreview";
import AddCourse from "./Main/course/AddCourse";
import UpdateCourse from "./Main/course/UpdateCourse";
import AssignCourse from "./Main/courseAssigned/AssignCourse";
import AssignUpdate from "./Main/courseAssigned/AssignUpdate";
import NewInsRegister from "./Main/instructor/NewInsRegister";
import InsEdit from "./Main/instructor/InsEdit";
import InsPreview from "./Main/instructor/InsPreview";
import MarkLearner from "./Main/attendance/learner/MarkLearner";
import MarkIns from "./Main/attendance/instructor/MarkIns";
import AddPayment from "./Main/payment/AddPayment";
import SmsAdd from "./Main/sms/SmsAdd";
import SmsSetting from "./Main/sms/SmsSetting";
import AddTest from "./Main/test/AddTest";
import UpdateTest from "./Main/test/UpdateTest";
import LearnerContainer from "./Main/learner/Container";
import InstructorContainer from "./Main/instructor/Container";
import AttendanceContainer from "./Main/attendance/Container";
// import AttStaffContainer from "./Main/attendance/staff/Container";
import AttLearnerContainer from "./Main/attendance/learner/Container";
import AttInstructorContainer from "./Main/attendance/instructor/Container";
import PaymentContainer from "./Main/payment/Container";
import TestContainer from "./Main/test/Container";
import SmsContainer from "./Main/sms/Container";
import CourseContainer from "./Main/course/Container";
import CourseAssignContainer from "./Main/courseAssigned/Container";
import LearnerSingleAttendance from "./Main/attendance/learner/LearnerSingleAttendance";
import LearnerSinglePayment from "./Main/payment/LearnerSinglePayment";
import LearnerSingleTest from "./Main/test/LearnerSingleTest";
import LearnerSingleAssign from "./Main/courseAssigned/LearnerSingleAssign";
import StaffContainer from "./Main/staff/Container";
import NewStaff from "./Main/staff/NewStaff";
import StaffEdit from "./Main/staff/StaffEdit";
import StaffPreview from "./Main/staff/StaffPreview";
import StaffTable from "./Main/staff/StaffTable";
import MarkStaff from "./Main/attendance/staff/MarkStaff";
import InstructorLearnerPayments from "./Main/payment/InstructorLearnerPayments";
import InsLearnerAddPayments from "./Main/payment/InsLearnerAddPayment";
import InsLearnerAttTable from "./Main/attendance/learner/InsLeanerAttTable";
import InsMarkAtt from "./Main/attendance/learner/InsMarkAtt";
import Form14Register from "./Components/FormGenerator/Form14Register";
import Form15 from "./Components/FormGenerator/Form15";
// import SingleUpdateTest from "./Main/test/SingleUpdateTest";
import DrivingCertificateForm5 from "./Components/FormGenerator/DrivingCertificateForm5";
import SplashScreen from "./Components/SplashScreen";
import Page404 from "./Components/Page404";

export const URL = import.meta.env.VITE_BACK_URL;


// Role-based wrapper component
// const ProtectedRoute = ({ allowedRoles, children }) => {
//   const { role } = useRole();
//   return allowedRoles.includes(role) ? children : <Navigate to="/" replace />;
// };

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <SplashScreen />
  ) : (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/form" element={<Form14Register />} />
      <Route path="/form15" element={<Form15 />} />
      <Route path="/Driving5" element={<DrivingCertificateForm5 />} />
      <Route path="*" element={<Page404 />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="learner" element={<LearnerContainer />}>
                <Route path="list" element={<LearnerTable />} />
                <Route path="new" element={<NewRegistration />} />
                <Route path=":admissionNumber/:id/edit" element={<LearnEdit />} />
                <Route path=":id/view" element={<LearnPreview />} />
              </Route>
              {/* other nested admin routes... */}
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Learner Routes */}
      <Route
        path="/learner/*"
        element={
          <ProtectedRoute allowedRoles={["learner"]}>
            <Routes>
              <Route path="learnerDash" element={<LearnerDash />} />
              <Route path="attendance" element={<LearnerSingleAttendance />} />
              <Route path="payment" element={<LearnerSinglePayment />} />
              <Route path="test-details" element={<LearnerSingleTest />} />
              <Route path="profile" element={<LearnerProfile />} />
              <Route path="course" element={<LearnerSingleAssign />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Instructor Routes */}
      <Route
        path="/instructor/*"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <Routes>
              <Route path="instructorDash" element={<InstructorDash />} />
              <Route path="attendance" element={<AttendanceContainer />}>
                <Route path="list" element={<InsLearnerAttTable />} />
                <Route path="add" element={<InsMarkAtt />} />
              </Route>
              <Route path="payment" element={<PaymentContainer />}>
                <Route path="list" element={<InstructorLearnerPayments />} />
                <Route path="add" element={<InsLearnerAddPayments />} />
              </Route>
              <Route path="profile" element={<InstructorProfile />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
