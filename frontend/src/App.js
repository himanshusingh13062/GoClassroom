import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import HomePage from "./pages/HomePage";
import ClassroomPage from "./pages/ClassroomPage";
import StudentClassroomPage from "./pages/StudentClassroomPage"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/teacher" element={<TeacherPage />} />

        {/* Teacher's classroom route */}
        <Route path="/classroom/:classroom_Id" element={<ClassroomPage />} />

        {/* Student's classroom route */}
        <Route path="/student/classroom/:classroom_Id" element={<StudentClassroomPage />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
