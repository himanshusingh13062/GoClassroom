"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import axios from "axios"
import CryptoJS from "crypto-js"

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true)
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
    designation: "",
  })

  const [error, setError] = useState("")
  const navigate = useNavigate()

  const isStudent = formData.userType === "student"
  const isTeacher = formData.userType === "teacher"

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const hashedPassword = CryptoJS.SHA256(formData.password).toString()

      if (isLogin) {
        const res = await axios.post("http://localhost:8080/login", {
          username: formData.username,
          password: hashedPassword,
        })

        const { token, user_type, username, user_id } = res.data

        if (!token) {
          setError("Login failed: No token received.")
          return
        }

        // Save token and user info in localStorage
        localStorage.setItem("token", token)
        localStorage.setItem("user_type", user_type)
        localStorage.setItem("username", username)
        localStorage.setItem("user_id", user_id)

        // Redirect based on role
        if (user_type === "student") {
          navigate("/student")
        } else if (user_type === "teacher") {
          navigate("/teacher")
        }
      } else {
        // Signup flow
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.")
          return
        }

        const signupRes = await axios.post("http://localhost:8080/signup", {
          username: formData.username,
          password: hashedPassword,
          user_type: formData.userType,
        })

        const userId = signupRes.data.user_id

        if (!userId) {
          setError("Signup failed: No user ID returned.")
          return
        }

        if (formData.userType === "student") {
          await axios.post("http://localhost:8080/student", {
            id: userId,
            enrollment_no: formData.enrollment_no,
            name: formData.name,
            year_id: Number.parseInt(formData.year_id),
            batch_id: Number.parseInt(formData.batch_id),
          })
        } else if (formData.userType === "teacher") {
          await axios.post("http://localhost:8080/teacher", {
            id: userId,
            teacher_code: formData.teacher_code,
            name: formData.name,
            designation: formData.designation,
          })
        }

        alert("Signup successful. Please login.")
        setIsLogin(true)
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong."
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 d-flex justify-content-center align-items-center py-5">
      {/* Custom styles */}
      <style>
        {`
          .auth-card {
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .auth-sidebar {
            background-image: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
          }
          .form-control, .form-select {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            transition: all 0.2s;
          }
          .form-control:focus, .form-select:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          }
          .btn-primary {
            background-color: #4f46e5;
            border-color: #4f46e5;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s;
          }
          .btn-primary:hover {
            background-color: #4338ca;
            border-color: #4338ca;
            transform: translateY(-2px);
          }
          .btn-link {
            color: #4f46e5;
            font-weight: 500;
          }
          .btn-link:hover {
            color: #4338ca;
          }
        `}
      </style>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="card auth-card border-0">
              <div className="row g-0">
                <div className="col-lg-5 d-none d-lg-block">
                  <div className="auth-sidebar h-100 d-flex flex-column justify-content-center p-5">
                    <h2 className="fw-bold mb-4">Welcome to GradeTrack</h2>
                    <p className="mb-4 opacity-75">
                      {isLogin
                        ? "Sign in to access your personalized dashboard and track your academic progress."
                        : "Create an account to start your journey with GradeTrack and unlock your academic potential."}
                    </p>
                    <div className="mt-auto">
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-white bg-opacity-25 p-2 me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-shield-check"
                            viewBox="0 0 16 16"
                          >
                            <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
                            <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                          </svg>
                        </div>
                        <span className="small">Secure authentication</span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-white bg-opacity-25 p-2 me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-graph-up"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fillRule="evenodd"
                              d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"
                            />
                          </svg>
                        </div>
                        <span className="small">Real-time grade tracking</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-white bg-opacity-25 p-2 me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-people"
                            viewBox="0 0 16 16"
                          >
                            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                          </svg>
                        </div>
                        <span className="small">Student-teacher collaboration</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-7">
                  <div className="p-4 p-lg-5">
                    <h3 className="fw-bold mb-4">{isLogin ? "Sign In" : "Create Account"}</h3>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                      {!isLogin && (
                        <>
                          <div className="mb-3">
                            <label className="form-label fw-medium">Role</label>
                            <select
                              className="form-select"
                              name="userType"
                              value={formData.userType}
                              onChange={handleChange}
                            >
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-medium">Full Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder="Enter your full name"
                            />
                          </div>
                        </>
                      )}

                      {/* Student Fields */}
                      {!isLogin && isStudent && (
                        <>
                          <div className="mb-3">
                            <label className="form-label fw-medium">Enrollment No</label>
                            <input
                              type="text"
                              className="form-control"
                              name="enrollment_no"
                              value={formData.enrollment_no}
                              onChange={handleChange}
                              required
                              placeholder="Enter your enrollment number"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-medium">Year ID</label>
                            <input
                              type="number"
                              className="form-control"
                              name="year_id"
                              value={formData.year_id}
                              onChange={handleChange}
                              required
                              placeholder="Enter your year ID"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-medium">Batch ID</label>
                            <input
                              type="number"
                              className="form-control"
                              name="batch_id"
                              value={formData.batch_id}
                              onChange={handleChange}
                              required
                              placeholder="Enter your batch ID"
                            />
                          </div>
                        </>
                      )}

                      {/* Teacher Fields */}
                      {!isLogin && isTeacher && (
                        <>
                          <div className="mb-3">
                            <label className="form-label fw-medium">Teacher Code</label>
                            <input
                              type="text"
                              className="form-control"
                              name="teacher_code"
                              value={formData.teacher_code}
                              onChange={handleChange}
                              required
                              placeholder="Enter your teacher code"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-medium">Designation</label>
                            <input
                              type="text"
                              className="form-control"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                              required
                              placeholder="Enter your designation"
                            />
                          </div>
                        </>
                      )}

                      {/* Common Fields */}
                      <div className="mb-3">
                        <label className="form-label fw-medium">Email / Username</label>
                        <input
                          type="email"
                          className="form-control"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email address"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-medium">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Enter your password"
                        />
                      </div>

                      {!isLogin && (
                        <div className="mb-3">
                          <label className="form-label fw-medium">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                          />
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary w-100 mt-2">
                        {isLogin ? "Sign In" : "Create Account"}
                      </button>
                    </form>

                    <div className="text-center mt-4">
                      <p className="mb-0">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
                          {isLogin ? "Sign Up" : "Sign In"}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup
