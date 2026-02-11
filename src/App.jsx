import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentRegister from "./pages/student/StudentRegister";
import StudentScan from "./pages/student/StudentScan";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student/scan" element={<StudentScan />} />
      </Routes>
    </div>
  );
}

export default App;
