"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { FaUserCircle, FaSignOutAlt, FaGraduationCap, FaUniversity } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const StudentPage = () => {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")
  const [classrooms, setClassrooms] = useState([])

  useEffect(() => {
    const fetchStudent = async () => {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("token")

      if (!userId || !token) {
        console.error("Missing user ID or token")
        setMessage("User is not authenticated. Please log in again.")
        return
      }

      try {
        const res = await axios.get(`http://localhost:8080/api/students/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setStudent(res.data)
      } catch (error) {
        console.error("Failed to fetch student info:", error.response?.data || error.message)
        setMessage("Failed to fetch student info. Please try again later.")
      }
    }

    const fetchClassrooms = async () => {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("token")

      if (!userId || !token) {
        console.error("Missing user ID or token")
        setMessage("User is not authenticated. Please log in again.")
        return
      }

      try {
        const res = await axios.get(`http://localhost:8080/api/students/${userId}/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Classrooms fetched successfully:", res.data)
        setClassrooms(res.data)
      } catch (err) {
        if (err.response) {
          console.error("Backend returned an error:")
          console.error("Status:", err.response.status)
          console.error("Data:", err.response.data)
          setMessage(`Error: ${err.response?.data?.message || 'Failed to fetch classrooms'}`)
        } else if (err.request) {
          console.error("No response received:", err.request)
          setMessage("No response received from server. Please check your internet connection.")
        } else {
          console.error("Error setting up request:", err.message)
          setMessage("An error occurred while setting up the request. Please try again later.")
        }
      }
    }

    fetchStudent()
    fetchClassrooms()
  }, [])

  const joinClassroom = async () => {
    const studentId = localStorage.getItem("user_id")
    const token = localStorage.getItem("token")

    if (!studentId || !token) {
      setMessage("Student ID or token is missing. Please log in again.")
      return
    }

    if (!code.trim()) {
      setMessage("Please enter a classroom code.")
      return
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/classroom/join",
        {
          student_id: parseInt(studentId),
          code: code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const classroomId = res.data.classroom_id
      setMessage(res.data.message || "Joined classroom successfully.")

      if (classroomId) {
        // Use capital "I" to match backend's :classroom_Id param
        navigate(`/student/classroom/${classroomId}`)
      }

    } catch (err) {
      console.error("Join classroom error:", err)

      if (err.response) {
        console.error("Error from backend:", err.response)
        setMessage(`Backend error: ${err.response?.data?.message || 'Failed to join classroom'}`)
      } else if (err.request) {
        console.error("No response received:", err.request)
        setMessage("Failed to communicate with the server. Please try again later.")
      } else {
        console.error("Error during setup:", err.message)
        setMessage(`Error: ${err.message || 'An unexpected error occurred'}`)
      }
    }
  }

  const downloadNote = async (classroomId, noteId) => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("You need to be logged in to download the file.")
      return
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/classroom/${classroomId}/note/${noteId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for handling binary data
        }
      )

      const fileURL = URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = fileURL
      link.download = "note-file" // Specify a default file name here
      link.click()
    } catch (error) {
      console.error("Error downloading the note:", error)
      alert("Failed to download the note. Please try again later.")
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom styles */}
      <style>
        {`
          .dashboard-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-radius: 12px;
          }
          .dashboard-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .sidebar {
            background-image: linear-gradient(135deg, #4f46e5, #7c3aed);
          }
          .nav-link {
            border-radius: 8px;
            margin-bottom: 0.5rem;
            color: rgba(255,255,255,0.8);
            transition: all 0.2s;
          }
          .nav-link:hover, .nav-link.active {
            background-color: rgba(255,255,255,0.1);
            color: white;
          }
          .nav-link i {
            width: 20px;
          }
          .profile-header {
            background-image: linear-gradient(to right, #4f46e5, #7c3aed);
            border-radius: 12px;
          }
          .btn-logout {
            background-color: #ef4444;
            border-color: #ef4444;
          }
          .btn-logout:hover {
            background-color: #dc2626;
            border-color: #dc2626;
          }
        `}
      </style>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-2 sidebar text-white p-0 d-none d-lg-block">
            <div className="d-flex flex-column min-vh-100 p-3">
              <a href="/" className="d-flex align-items-center mb-4 text-white text-decoration-none">
                <FaGraduationCap className="me-2" size={24} />
                <span className="fs-4 fw-bold">GradeTrack</span>
              </a>

              <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                  <a href="#" className="nav-link active d-flex align-items-center">
                    <i className="me-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-speedometer2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z" />
                        <path
                          fillRule="evenodd"
                          d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z"
                        />
                      </svg>
                    </i>
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link d-flex align-items-center">
                    <i className="me-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-mortarboard"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5ZM8 8.46 1.758 5.965 8 3.052l6.242 2.913L8 8.46Z" />
                        <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46l-3.892-1.556Z" />
                      </svg>
                    </i>
                    Courses
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link d-flex align-items-center">
                    <i className="me-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-graph-up"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"
                        />
                      </svg>
                    </i>
                    Grades
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link d-flex align-items-center">
                    <i className="me-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-calendar-check"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                      </svg>
                    </i>
                    Attendance
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link d-flex align-items-center">
                    <i className="me-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-file-earmark-text"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                        <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                      </svg>
                    </i>
                    Assignments
                  </a>
                </li>
              </ul>

              <hr className="my-3 opacity-25" />

              <button
                className="btn btn-logout d-flex align-items-center justify-content-center"
                onClick={() => {
                  localStorage.clear()
                  window.location.href = "/login"
                }}
              >
                <FaSignOutAlt className="me-2" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-10 p-0">
            <div className="p-4">
              {/* Mobile Header */}
              <div className="d-flex d-lg-none align-items-center justify-content-between mb-4">
                <a href="/" className="text-decoration-none">
                  <h4 className="mb-0 text-primary fw-bold d-flex align-items-center">
                    <FaGraduationCap className="me-2" />
                    GradeTrack
                  </h4>
                </a>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    localStorage.clear()
                    window.location.href = "/login"
                  }}
                >
                  <FaSignOutAlt className="me-1" /> Sign Out
                </button>
              </div>

              {/* Profile Header */}
              <div className="profile-header text-white p-4 mb-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <FaUserCircle size={64} className="me-3" />
                      <div>
                        <h2 className="fw-bold mb-1">{student ? student.name : "Loading..."}</h2>
                        <p className="mb-0 opacity-75">{student ? student.enrollment_no : ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <div className="badge bg-white text-primary fs-6 px-3 py-2">
                      Year {student ? student.year_id : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="row g-4">
                {/* University Info */}
                <div className="col-md-6">
                  <div className="card dashboard-card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-4">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                          <FaUniversity className="text-primary" size={24} />
                        </div>
                        <h5 className="card-title mb-0 fw-bold">University Information</h5>
                      </div>
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                          <span className="text-muted">University:</span>
                          <span className="fw-medium">Guru Gobind Singh Indraprasth University</span>
                        </li>
                        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                          <span className="text-muted">College:</span>
                          <span className="fw-medium">University School Of Automation And Robotics</span>
                        </li>
                        <li className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                          <span className="text-muted">Batch:</span>
                          <span className="fw-medium">2023-2027</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* University Logo */}
                <div className="col-md-6">
                  <div className="card dashboard-card h-100 border-0 shadow-sm">
                    <div className="card-body p-4 d-flex flex-column justify-content-center align-items-center">
                      <img
                        src="https://s.yimg.com/zb/imgv1/6dc88d74-6442-3a96-9832-25001154c121/t_500x300"
                        alt="University Logo"
                        className="img-fluid"
                        style={{ maxHeight: "180px", objectFit: "contain" }}
                      />
                      <h5 className="mt-4 text-center">Guru Gobind Singh Indraprasth University</h5>
                    </div>
                  </div>
                </div>
          {/* Joining classroom */}
<div className="mb-6">
  <h3 className="text-xl font-semibold mb-2">Join a Classroom</h3>
  <input
    type="text"
    value={code}
    onChange={(e) => setCode(e.target.value)}
    placeholder="Enter Classroom Code"
    className="border px-3 py-2 rounded w-full mb-2"
  />
  <button
    onClick={joinClassroom}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    Join
  </button>
  {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}

  {/* Classroom cards */}
  {classrooms.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {classrooms.map((cls) => (
        <div
          key={cls.id}
          className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg"
          onClick={() => navigate(`/student/classroom/${cls.id}`)}
        >
          <h2 className="text-lg font-semibold">{cls.name}</h2>
          <p className="text-sm text-gray-500">Code: {cls.code}</p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-600 mt-4">You haven't joined any classrooms yet.</p>
  )}
</div>


                {/* Quick Stats */}
                <div className="col-12">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="card dashboard-card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="#198754"
                                className="bi bi-mortarboard"
                                viewBox="0 0 16 16"
                              >
                                <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5ZM8 8.46 1.758 5.965 8 3.052l6.242 2.913L8 8.46Z" />
                                <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46l-3.892-1.556Z" />
                              </svg>
                            </div>
                            <div>
                              <h6 className="text-muted mb-1">Current GPA</h6>
                              <h3 className="mb-0 fw-bold">3.8</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card dashboard-card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="#4f46e5"
                                className="bi bi-book"
                                viewBox="0 0 16 16"
                              >
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                              </svg>
                            </div>
                            <div>
                              <h6 className="text-muted mb-1">Courses</h6>
                              <h3 className="mb-0 fw-bold">6</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card dashboard-card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="#ffc107"
                                className="bi bi-calendar-check"
                                viewBox="0 0 16 16"
                              >
                                <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                              </svg>
                            </div>
                            <div>
                              <h6 className="text-muted mb-1">Attendance</h6>
                              <h3 className="mb-0 fw-bold">92%</h3>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default StudentPage
