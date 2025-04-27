import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa"; // Importing icons

const StudentPage = () => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        console.error("Missing user ID or token");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:8080/api/students/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudent(res.data);
      } catch (error) {
        console.error("Failed to fetch student info:", error.response?.data || error.message);
      }
    };

    fetchStudent();
  }, []);

  return (
    <div className="container mt-5">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <a className="navbar-brand" href="/">Student Dashboard</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
      </nav>

      {/* Main Content with Grid Layout */}
      <div className="row justify-content-center mt-4">
        {/* Student Info Card (Left) */}
        <div className="col-md-7 col-lg-7">
          <div className="card p-4 shadow-lg h-100">
            <div className="d-flex align-items-center">
              <FaUserCircle size={80} color="#007bff" />
              <div className="ms-3">
                <h3>{student ? student.name : "Loading..."}</h3>
                <p className="text-muted">{student ? student.enrollment_no : ""}</p>
              </div>
            </div>

            <div className="mt-4">
              <p><strong>Year ID:</strong> {student ? student.year_id : "Loading..."}</p>
              <p><strong>University:</strong> Guru Gobind Singh Indraprasth University </p>
              <p><strong>College:</strong> University School Of Automation And Robotics </p>
            </div>
          </div>
        </div>

        {/* University Logo Image (Right) */}
        <div className="col-md-5 col-lg-3 d-flex justify-content-end">
          <div className="card shadow-lg" style={{ width: "600px", height: "300px" }}>
            <img 
              src="https://s.yimg.com/zb/imgv1/6dc88d74-6442-3a96-9832-25001154c121/t_500x300" // University logo
              alt="University Logo"
              className="card-img-top" 
              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            />
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="text-center mt-4">
        <button className="btn btn-danger" onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}>
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default StudentPage;
