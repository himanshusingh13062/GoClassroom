"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import {
  FaGraduationCap,
  FaBook,
  FaClipboardList,
  FaFileAlt,
  FaDownload,
  FaCalendarAlt,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTrophy,
  FaMedal,
  FaAward,
} from "react-icons/fa"

const StudentClassroomPage = () => {
  const { classroom_Id } = useParams()
  const [classroom, setClassroom] = useState(null)
  const [notes, setNotes] = useState([])
  const [assignments, setAssignments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [performance, setPerformance] = useState(null)
  const [marks, setMarks] = useState([])
  const [activeTab, setActiveTab] = useState("notes")
  const [submissionUrl, setSubmissionUrl] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    rate: 0
  })
  const [loading, setLoading] = useState({
    classroom: true,
    notes: true,
    assignments: true,
    attendance: true,
    marks: true
  })

  const token = localStorage.getItem("token")
  const studentId = localStorage.getItem("user_id")

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        // Fetch classroom details
        setLoading(prev => ({ ...prev, classroom: true }))
        const classroomResponse = await axios.get(`http://localhost:8080/api/student/classroom/${classroom_Id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Set only the necessary classroom fields: id, code, and name
        setClassroom({
          id: classroomResponse.data.id,
          code: classroomResponse.data.code,
          name: classroomResponse.data.name,
        })
        setLoading(prev => ({ ...prev, classroom: false }))

        // Fetch notes
        setLoading(prev => ({ ...prev, notes: true }))
        const notesResponse = await axios.get(`http://localhost:8080/api/classroom/${classroom_Id}/notes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setNotes(notesResponse.data.notes || [])
        setLoading(prev => ({ ...prev, notes: false }))

        // Fetch assignments
        setLoading(prev => ({ ...prev, assignments: true }))
        const assignmentsResponse = await axios.get(`http://localhost:8080/api/classroom/${classroom_Id}/assignments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setAssignments(assignmentsResponse.data.assignments || [])
        setLoading(prev => ({ ...prev, assignments: false }))

        // Fetch attendance
        setLoading(prev => ({ ...prev, attendance: true }))
        try {
          const attendanceResponse = await axios.get(`http://localhost:8080/api/students/${studentId}/attendance`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            // No need to filter by classroom_id in the frontend request
          })
          
          console.log("Attendance API response:", attendanceResponse.data);
          
          const attendanceData = attendanceResponse.data.attendance || [];
          console.log("Attendance data:", attendanceData);
          
          setAttendance(attendanceData);
          
          // Calculate attendance statistics
          if (attendanceData.length > 0) {
            const present = attendanceData.filter(a => a.status === "Present").length;
            const absent = attendanceData.filter(a => a.status === "Absent").length;
            const late = attendanceData.filter(a => a.status === "Late").length;
            const total = attendanceData.length;
            const rate = total > 0 ? (present / total) * 100 : 0;
            
            setAttendanceStats({
              present,
              absent,
              late,
              total,
              rate
            });
          }
        } catch (error) {
          console.error("Error fetching attendance:", error);
        }
        setLoading(prev => ({ ...prev, attendance: false }))

        // Fetch marks and performance data
        setLoading(prev => ({ ...prev, marks: true }))
        try {
          const marksResponse = await axios.get(
            `http://localhost:8080/api/students/${studentId}/classroom/${classroom_Id}/marks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          setMarks(marksResponse.data.marks || [])
          setPerformance(marksResponse.data.performance || null)
        } catch (error) {
          console.log("Marks/Performance data not available:", error.message);
          // Just continue without marks data
        }
        setLoading(prev => ({ ...prev, marks: false }))
      } catch (error) {
        console.error("Error fetching classroom data", error)
        // Reset loading states on error
        setLoading({
          classroom: false,
          notes: false,
          assignments: false,
          attendance: false,
          marks: false
        })
      }
    }

    if (classroom_Id && studentId && token) {
      fetchClassroomData()
    }

  }, [classroom_Id, token, studentId])

  const handleSubmitAssignment = async (e) => {
    e.preventDefault()

    try {
      await axios.post(
        `http://localhost:8080/api/assignments/submit`,
        {
          student_id: Number(studentId),
          assignment_id: selectedAssignment.assignment_id,
          submission_url: submissionUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Close modal and reset form
      setShowSubmitModal(false)
      setSubmissionUrl("")
      setSelectedAssignment(null)

      // Show success message
      alert("Assignment submitted successfully!")
    } catch (error) {
      console.error("Error submitting assignment", error)
      alert("Failed to submit assignment. Please try again.")
    }
  }

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment)
    setShowSubmitModal(true)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <FaCheckCircle className="text-success me-1" />;
      case "Absent":
        return <FaTimesCircle className="text-danger me-1" />;
      case "Late":
        return <FaClock className="text-warning me-1" />;
      default:
        return null;
    }
  };

  // Helper function to get color class based on percentage
  const getPercentageColorClass = (percentage) => {
    if (percentage >= 90) return "bg-success";
    if (percentage >= 70) return "bg-primary";
    if (percentage >= 50) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom styles */}
      <style>
        {`
          .classroom-header {
            background-image: linear-gradient(to right, #4f46e5, #7c3aed);
            border-radius: 12px;
          }
          .nav-tabs .nav-link {
            color: #6b7280;
            border: none;
            padding: 1rem 1.5rem;
            font-weight: 500;
            border-radius: 0;
            border-bottom: 2px solid transparent;
          }
          .nav-tabs .nav-link.active {
            color: #4f46e5;
            background-color: transparent;
            border-bottom: 2px solid #4f46e5;
          }
          .nav-tabs .nav-link:hover:not(.active) {
            border-bottom: 2px solid #e5e7eb;
          }
          .content-card {
            border-radius: 12px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .content-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .note-card, .assignment-card {
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          .note-card:hover, .assignment-card:hover {
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .note-card .card-header, .assignment-card .card-header {
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
          }
          .due-date-badge {
            background-color: #4f46e5;
            color: white;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 0.8rem;
          }
          .attendance-badge {
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 0.8rem;
          }
          .attendance-present {
            background-color: #10b981;
            color: white;
          }
          .attendance-absent {
            background-color: #ef4444;
            color: white;
          }
          .attendance-late {
            background-color: #f59e0b;
            color: white;
          }
          .modal-backdrop {
            background-color: rgba(0, 0, 0, 0.5);
          }
          .progress-bar {
            background-color: #4f46e5;
          }
          .btn-primary {
            background-color: #4f46e5;
            border-color: #4f46e5;
          }
          .btn-primary:hover {
            background-color: #4338ca;
            border-color: #4338ca;
          }
          .btn-outline-primary {
            color: #4f46e5;
            border-color: #4f46e5;
          }
          .btn-outline-primary:hover {
            background-color: #4f46e5;
            border-color: #4f46e5;
            color: white;
          }
          .stat-card {
            border-radius: 12px;
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
          }
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .stat-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            margin-bottom: 1rem;
          }
          .stat-present {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }
          .stat-absent {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          .stat-late {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
          }
          .stat-total {
            background-color: rgba(79, 70, 229, 0.1);
            color: #4f46e5;
          }
          .grade-badge {
            font-size: 2rem;
            font-weight: bold;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin: 0 auto 1rem;
          }
          .grade-a-plus {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }
          .grade-a {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }
          .grade-b {
            background-color: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
          }
          .grade-c {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
          }
          .grade-d {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          .grade-f {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          .mark-card {
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          .mark-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .mark-percentage {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
          }
        `}
      </style>

      <div className="container py-5">
        {/* Classroom Header */}
        {loading.classroom ? (
          <div className="card shadow-sm p-4 mb-4">
            <div className="d-flex align-items-center">
              <div className="spinner-border text-primary me-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mb-0">Loading classroom details...</p>
            </div>
          </div>
        ) : classroom ? (
          <div className="classroom-header text-white p-4 mb-4">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                <FaGraduationCap size={24} />
              </div>
              <div>
                <h1 className="mb-1 fw-bold">{classroom.name}</h1>
                <div className="d-flex align-items-center">
                  <span className="badge bg-white text-primary">Code: {classroom.code}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            <p className="mb-0">Could not load classroom details. Please try again later.</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              <FaBook className="me-2" /> Notes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "assignments" ? "active" : ""}`}
              onClick={() => setActiveTab("assignments")}
            >
              <FaClipboardList className="me-2" /> Assignments
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => setActiveTab("attendance")}
            >
              <FaCalendarAlt className="me-2" /> Attendance
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <FaChartBar className="me-2" /> Performance
            </button>
          </li>
        </ul>

        {/* Notes Section */}
        {activeTab === "notes" && (
          <div>
            <h5 className="fw-bold mb-3">Class Notes</h5>
            {loading.notes ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="row g-4">
                {notes.map((note) => (
                  <div className="col-md-6 col-lg-4" key={note.note_id}>
                    <div className="card note-card border-0 shadow-sm h-100">
                      <div className="card-header py-3">
                        <h6 className="mb-0 fw-bold">{note.title}</h6>
                      </div>
                      <div className="card-body p-3">
                        <p className="card-text">{note.content}</p>
                        {note.file_url && (
                          <a
                            href={note.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary d-flex align-items-center w-100 justify-content-center"
                          >
                            <FaDownload className="me-2" /> Download File
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card content-card border-0 shadow-sm">
                <div className="card-body p-4 text-center">
                  <FaFileAlt size={48} className="text-muted mb-3" />
                  <p className="mb-0">No notes available for this classroom.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assignments Section */}
        {activeTab === "assignments" && (
          <div>
            <h5 className="fw-bold mb-3">Assignments</h5>
            {loading.assignments ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : assignments && assignments.length > 0 ? (
              <div className="row g-4">
                {assignments.map((assignment) => (
                  <div className="col-md-6" key={assignment.assignment_id}>
                    <div className="card assignment-card border-0 shadow-sm h-100">
                      <div className="card-header py-3">
                        <h6 className="mb-0 fw-bold">{assignment.title}</h6>
                      </div>
                      <div className="card-body p-3">
                        <p className="card-text">{assignment.description}</p>
                        <div className="d-flex align-items-center mb-3">
                          <span className="due-date-badge">Due: {formatDate(assignment.due_date)}</span>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          {assignment.file_url && (
                            <a
                              href={assignment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                            >
                              <FaDownload className="me-2" /> Download Assignment
                            </a>
                          )}
                          <button
                            className="btn btn-sm btn-primary d-flex align-items-center justify-content-center"
                            onClick={() => openSubmitModal(assignment)}
                          >
                            Submit Assignment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card content-card border-0 shadow-sm">
                <div className="card-body p-4 text-center">
                  <FaClipboardList size={48} className="text-muted mb-3" />
                  <p className="mb-0">No assignments available for this classroom.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attendance Section */}
        {activeTab === "attendance" && (
          <div>
            <h5 className="fw-bold mb-3">Your Attendance</h5>
            
            {loading.attendance ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Attendance Stats Cards */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6 col-lg-3">
                    <div className="card stat-card">
                      <div className="card-body p-4">
                        <div className="stat-icon stat-present">
                          <FaCheckCircle size={24} />
                        </div>
                        <h3 className="fw-bold mb-1">{attendanceStats.present}</h3>
                        <p className="text-muted mb-0">Present Days</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="card stat-card">
                      <div className="card-body p-4">
                        <div className="stat-icon stat-absent">
                          <FaTimesCircle size={24} />
                        </div>
                        <h3 className="fw-bold mb-1">{attendanceStats.absent}</h3>
                        <p className="text-muted mb-0">Absent Days</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="card stat-card">
                      <div className="card-body p-4">
                        <div className="stat-icon stat-late">
                          <FaClock size={24} />
                        </div>
                        <h3 className="fw-bold mb-1">{attendanceStats.late}</h3>
                        <p className="text-muted mb-0">Late Days</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="card stat-card">
                      <div className="card-body p-4">
                        <div className="stat-icon stat-total">
                          <FaCalendarAlt size={24} />
                        </div>
                        <h3 className="fw-bold mb-1">{attendanceStats.total}</h3>
                        <p className="text-muted mb-0">Total Days</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Attendance Progress */}
                <div className="card content-card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">Attendance Rate</h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Overall Attendance</span>
                      <span className="fw-bold">{attendanceStats.rate.toFixed(2)}%</span>
                    </div>
                    <div className="progress" style={{ height: "10px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${attendanceStats.rate}%` }}
                        aria-valuenow={attendanceStats.rate}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Attendance Records Table */}
                <div className="card content-card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">Attendance Records</h6>
                    {attendance && attendance.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.map((record) => (
                              <tr key={record.id}>
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>
                                  <span
                                    className={`attendance-badge ${
                                      record.status === "Present"
                                        ? "attendance-present"
                                        : record.status === "Absent"
                                          ? "attendance-absent"
                                          : "attendance-late"
                                    }`}
                                  >
                                    {getStatusIcon(record.status)} {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FaCalendarAlt size={48} className="text-muted mb-3" />
                        <p className="mb-0">No attendance records available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Performance Section */}
        {activeTab === "performance" && (
          <div>
            <h5 className="fw-bold mb-3">Your Performance</h5>
            {loading.marks ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Performance Summary */}
                <div className="row g-4 mb-4">
                  {performance ? (
                    <>
                      <div className="col-md-6 col-lg-3">
                        <div className="card stat-card">
                          <div className="card-body p-4 text-center">
                            <div className={`grade-badge grade-${performance.grade.toLowerCase().replace('+', '-plus')}`}>
                              {performance.grade}
                            </div>
                            <h5 className="fw-bold mb-0">Grade</h5>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="card stat-card">
                          <div className="card-body p-4">
                            <div className="stat-icon" style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "#4f46e5" }}>
                              <FaTrophy size={24} />
                            </div>
                            <h3 className="fw-bold mb-1">{performance.overall_percentage.toFixed(1)}%</h3>
                            <p className="text-muted mb-0">Overall Score</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="card stat-card">
                          <div className="card-body p-4">
                            <div className="stat-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                              <FaCalendarAlt size={24} />
                            </div>
                            <h3 className="fw-bold mb-1">{performance.attendance_rate.toFixed(1)}%</h3>
                            <p className="text-muted mb-0">Attendance Rate</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="card stat-card">
                          <div className="card-body p-4">
                            <div className="stat-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                              <FaClipboardList size={24} />
                            </div>
                            <h3 className="fw-bold mb-1">{performance.total_assignments}</h3>
                            <p className="text-muted mb-0">Total Assignments</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="col-12">
                      <div className="card content-card border-0 shadow-sm">
                        <div className="card-body p-4 text-center">
                          <FaChartBar size={48} className="text-muted mb-3" />
                          <p className="mb-0">Performance summary is not available yet.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Marks List */}
                <div className="card content-card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">Your Marks</h6>
                    {marks && marks.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Type</th>
                              <th>Score</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {marks.map((mark, index) => (
                              <tr key={index}>
                                <td className="fw-medium">{mark.title}</td>
                                <td className="text-capitalize">{mark.type}</td>
                                <td>
                                  <span className={`mark-percentage ${getPercentageColorClass(mark.percentage)}`}>
                                    {mark.score}/{mark.max_score} ({mark.percentage.toFixed(1)}%)
                                  </span>
                                </td>
                                <td>{new Date(mark.date).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FaMedal size={48} className="text-muted mb-3" />
                        <p className="mb-0">No marks recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Submit Assignment Modal */}
        {showSubmitModal && (
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Submit Assignment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowSubmitModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmitAssignment}>
                    <div className="mb-3">
                      <label className="form-label">Assignment</label>
                      <input type="text" className="form-control" value={selectedAssignment.title} disabled />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Submission URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter URL to your submission (Google Drive, GitHub, etc.)"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                        required
                      />
                      <div className="form-text">
                        Please upload your assignment to a cloud storage service and provide the link here.
                      </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentClassroomPage