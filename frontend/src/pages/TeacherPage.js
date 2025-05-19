"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { FaChalkboardTeacher, FaPlus, FaSignOutAlt, FaClipboardList, FaUserCircle } from "react-icons/fa"

const TeacherPage = () => {
  const [teacher, setTeacher] = useState(null)
  const [classrooms, setClassrooms] = useState([])
  const [newClassroomName, setNewClassroomName] = useState("")

  useEffect(() => {
    const fetchTeacher = async () => {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get(`http://localhost:8080/api/teachers/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTeacher(res.data)
      } catch (error) {
        console.error("Failed to fetch teacher info:", error)
      }
    }
    fetchTeacher()
  }, [])

  useEffect(() => {
    const fetchClassrooms = async () => {
      const teacherId = localStorage.getItem("user_id")
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get(`http://localhost:8080/api/classroom/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setClassrooms(res.data.classrooms)
      } catch (error) {
        console.error("Failed to load classrooms:", error)
      }
    }
    fetchClassrooms()
  }, [])

  const handleCreateClassroom = async () => {
    if (!newClassroomName) return
    const teacherId = localStorage.getItem("user_id")
    const token = localStorage.getItem("token")

    try {
      await axios.post(
        "http://localhost:8080/api/classroom/create",
        {
          teacher_id: Number.parseInt(teacherId),
          name: newClassroomName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      window.location.reload()
    } catch (error) {
      console.error("Failed to create classroom:", error)
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
          .classroom-card {
            transition: all 0.3s ease;
            border-radius: 12px;
            overflow: hidden;
          }
          .classroom-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .classroom-card .card-header {
            background-image: linear-gradient(to right, #4f46e5, #7c3aed);
            color: white;
            border: none;
          }
          .classroom-code {
            background-color: rgba(255,255,255,0.2);
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 0.8rem;
          }
          .btn-primary {
            background-color: #4f46e5;
            border-color: #4f46e5;
          }
          .btn-primary:hover {
            background-color: #4338ca;
            border-color: #4338ca;
          }
        `}
      </style>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-2 sidebar text-white p-0 d-none d-lg-block">
            <div className="d-flex flex-column min-vh-100 p-3">
              <a href="/" className="d-flex align-items-center mb-4 text-white text-decoration-none">
                <FaChalkboardTeacher className="me-2" size={24} />
                <span className="fs-4 fw-bold">GradeTrack</span>
              </a>

              <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                  <a href="#" className="nav-link active d-flex align-items-center" >
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
                    Classrooms
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
                        className="bi bi-people"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                      </svg>
                    </i>
                    Students
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
                    <FaChalkboardTeacher className="me-2" />
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
                        <h2 className="fw-bold mb-1">{teacher ? teacher.name : "Loading..."}</h2>
                        <p className="mb-0 opacity-75">{teacher ? teacher.designation : ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <div className="badge bg-white text-primary fs-6 px-3 py-2">
                      Teacher Code: {teacher ? teacher.teacher_code : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Classroom Section */}
              <div className="card dashboard-card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-3">Create New Classroom</h5>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter classroom name"
                      value={newClassroomName}
                      onChange={(e) => setNewClassroomName(e.target.value)}
                    />
                    <button className="btn btn-primary d-flex align-items-center" onClick={handleCreateClassroom}>
                      <FaPlus className="me-2" /> Create
                    </button>
                  </div>
                </div>
              </div>

              {/* Classrooms Section */}
              <h4 className="fw-bold mb-3">My Classrooms</h4>

              {classrooms && classrooms.length > 0 ? (
                <div className="row g-4">
                  {classrooms.map((classroom) => (
                    <div className="col-md-6 col-lg-4" key={classroom.id}>
                      <div className="card classroom-card border-0 shadow-sm h-100">
                        <div className="card-header py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">{classroom.name}</h5>
                            <span className="classroom-code">{classroom.code}</span>
                          </div>
                        </div>
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <FaClipboardList className="text-primary me-2" />
                            <span>Created: {new Date(classroom.created_at).toLocaleDateString()}</span>
                          </div>
                          <Link to={`/classroom/${classroom.id}`} className="btn btn-primary w-100 mt-2">
                            Manage Classroom
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card dashboard-card border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <p className="mb-0">No classrooms created yet. Create your first classroom above.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherPage
