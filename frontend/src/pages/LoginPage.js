import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import CryptoJS from 'crypto-js';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    userType: "student", 
    name: "",
    enrollment_no: "",
    year_id: "",
    batch_id: "",
    teacher_code: "",
    designation: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isStudent = formData.userType === "student";
  const isTeacher = formData.userType === "teacher";

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const hashedPassword = CryptoJS.SHA256(formData.password).toString();
  
      if (isLogin) {
        const res = await axios.post("http://localhost:8080/login", {
          username: formData.username,
          password: hashedPassword
        });
  
        const { token, user_type, username, user_id } = res.data;
  
        if (!token) {
          setError("Login failed: No token received.");
          return;
        }
  
        // Save token and user info in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user_type", user_type);
        localStorage.setItem("username", username);
        localStorage.setItem("user_id", user_id); 
  
        // Redirect based on role
        if (user_type === "student") {
          navigate("/student");
        } else if (user_type === "teacher") {
          navigate("/teacher");
        }
      } else {
        // Signup flow
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
  
        const signupRes = await axios.post("http://localhost:8080/signup", {
          username: formData.username,
          password: hashedPassword,
          user_type: formData.userType
        });
  
        const userId = signupRes.data.user_id;
  
        if (!userId) {
          setError("Signup failed: No user ID returned.");
          return;
        }
  
        if (formData.userType === "student") {
          await axios.post("http://localhost:8080/student", {
            id: userId,
            enrollment_no: formData.enrollment_no,
            name: formData.name,
            year_id: parseInt(formData.year_id),
            batch_id: parseInt(formData.batch_id)
          });
        } else if (formData.userType === "teacher") {
          await axios.post("http://localhost:8080/teacher", {
            id: userId,
            teacher_code: formData.teacher_code,
            name: formData.name,
            designation: formData.designation
          });
        }
  
        alert("Signup successful. Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong.";
      setError(msg);
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: "400px", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 className="text-center mb-3">{isLogin ? "Login" : "Sign Up"}</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" name="userType" value={formData.userType} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Student Fields */}
          {!isLogin && isStudent && (
            <>
              <div className="mb-3">
                <label className="form-label">Enrollment No</label>
                <input
                  type="text"
                  className="form-control"
                  name="enrollment_no"
                  value={formData.enrollment_no}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Year ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="year_id"
                  value={formData.year_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Batch ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="batch_id"
                  value={formData.batch_id}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Teacher Fields */}
          {!isLogin && isTeacher && (
            <>
              <div className="mb-3">
                <label className="form-label">Teacher Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="teacher_code"
                  value={formData.teacher_code}
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
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="mb-3">
            <label className="form-label">Email / Username</label>
            <input
              type="email"
              className="form-control"
              name="username"
              value={formData.username}
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
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
