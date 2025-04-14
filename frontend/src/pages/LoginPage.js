import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    // student fields
    batch: "",
    collegeYear: "",
    courseName: "",
    // teacher fields
    teacherId: "",
    designation: "",
    department: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const response = await axios.post("http://localhost:8080/api/login", {
          email: formData.email,
          password: formData.password,
        });

        if (response.data.role) {
          localStorage.setItem("role", response.data.role);
          navigate(response.data.role === "student" ? "/student" : "/teacher");
        } else {
          setError("Invalid role received.");
        }
      } else {
        // Signup route
        const response = await axios.post("http://localhost:8080/api/signup", formData);
        console.log("Signup Response:", response.data);
        alert("Signup successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const isStudent = formData.role === "student";
  const isTeacher = formData.role === "teacher";

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow p-4"
        style={{ width: "400px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <h2 className="text-center mb-4">{isLogin ? "Login" : "Sign Up"}</h2>

        {error && <p className="alert alert-danger text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="fullName"
                  placeholder="Enter your name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {/* Student Fields */}
              {isStudent && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Batch</label>
                    <input
                      type="text"
                      className="form-control"
                      name="batch"
                      placeholder="Enter your batch"
                      value={formData.batch}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">College Year</label>
                    <input
                      type="text"
                      className="form-control"
                      name="collegeYear"
                      placeholder="Enter your college year"
                      value={formData.collegeYear}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Course Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="courseName"
                      placeholder="Enter your course name"
                      value={formData.courseName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {/* Teacher Fields */}
              {isTeacher && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Teacher ID</label>
                    <input
                      type="text"
                      className="form-control"
                      name="teacherId"
                      placeholder="Enter your ID"
                      value={formData.teacherId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      name="designation"
                      placeholder="e.g. Assistant Professor"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      placeholder="Enter department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Common for Login & Signup */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-3">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
