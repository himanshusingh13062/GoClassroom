"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaBook,
  FaClipboardList,
  FaTrash,
  FaFileAlt,
  FaDownload,
  FaPlus,
  FaUserCheck,
  FaChartBar,
  FaPencilAlt,
  FaTimes,
} from "react-icons/fa";

const ClassroomPage = () => {
  const { classroom_Id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [noteFileUrl, setNoteFileUrl] = useState("");
  const [assignmentFileUrl, setAssignmentFileUrl] = useState("");
  const [activeTab, setActiveTab] = useState("notes");

  // Attendance state
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState([]);

  // Marks state
  const [marks, setMarks] = useState([]);
  const [markTitle, setMarkTitle] = useState("");
  const [markType, setMarkType] = useState("assignment");
  const [markDate, setMarkDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [editingMark, setEditingMark] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        const classroomResponse = await axios.get(
          `http://localhost:8080/api/classroom/${classroom_Id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClassroom(classroomResponse.data.classroom);

        const notesResponse = await axios.get(
          `http://localhost:8080/api/classroom/${classroom_Id}/notes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNotes(notesResponse.data.notes || []);

        const assignmentsResponse = await axios.get(
          `http://localhost:8080/api/classroom/${classroom_Id}/assignments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAssignments(assignmentsResponse.data.assignments || []);

        // Fetch students for attendance and marks
        const studentsResponse = await axios.get(
          `http://localhost:8080/api/classroom/${classroom_Id}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStudents(studentsResponse.data.students || []);

        // Fetch marks
        const marksResponse = await axios.get(
          `http://localhost:8080/api/classroom/${classroom_Id}/marks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMarks(marksResponse.data.marks || []);
      } catch (error) {
        console.error("Error fetching classroom data", error);
      }
    };

    fetchClassroomData();
  }, [classroom_Id, token]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      // Prepare the attendance records
      const records = Object.keys(attendanceData).map((studentId) => ({
        student_id: parseInt(studentId), // Ensure student_id is an integer
        status: attendanceData[studentId],
      }));

      // Validate that we have records to submit
      if (records.length === 0) {
        alert("Please mark attendance for at least one student");
        return;
      }

      console.log('Submitting attendance records:', {
        classroom_id: parseInt(classroom_Id),
        date: attendanceDate,
        records: records,
      });

      // Send attendance data to backend
      const response = await axios.post(
        `http://localhost:8080/api/attendance`,
        {
          classroom_id: parseInt(classroom_Id),
          date: attendanceDate,
          records: records,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Attendance submission response:', response.data);
      alert("Attendance submitted successfully");
      
      // Reset attendance data after submission
      setAttendanceData({});
    } catch (error) {
      console.error("Error submitting attendance", error);
      alert(`Failed to submit attendance: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:8080/api/classroom/${classroom_Id}/notes`,
        {
          title: noteTitle,
          content: noteContent,
          file_url: noteFileUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form fields
      setNoteTitle("");
      setNoteContent("");
      setNoteFileUrl("");

      // Fetch updated notes list
      const notesResponse = await axios.get(
        `http://localhost:8080/api/classroom/${classroom_Id}/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes(notesResponse.data.notes || []);
    } catch (error) {
      console.error("Error creating note", error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:8080/api/classroom/${classroom_Id}/assignments`,
        {
          classroom_id: Number.parseInt(classroom_Id),
          title: assignmentTitle,
          description: assignmentDescription,
          due_date: assignmentDueDate,
          file_url: assignmentFileUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
      setAssignmentFileUrl("");

      const assignmentsResponse = await axios.get(
        `http://localhost:8080/api/classroom/${classroom_Id}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssignments(assignmentsResponse.data.assignments || []);
    } catch (error) {
      console.error("Error creating assignment", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/classroom/${classroom_Id}/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove deleted note from the state
      setNotes(notes.filter((note) => note.note_id !== noteId));
    } catch (error) {
      console.error("Error deleting note", error);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/classroom/${classroom_Id}/assignments/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssignments(assignments.filter((assignment) => assignment.assignment_id !== assignmentId));
    } catch (error) {
      console.error("Error deleting assignment", error);
    }
  };

  // Marks handling functions
  const handleAddMark = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }
    
    try {
      const markData = {
        student_id: parseInt(selectedStudent),
        classroom_id: parseInt(classroom_Id),
        title: markTitle,
        score: parseFloat(score),
        max_score: parseFloat(maxScore),
        type: markType,
        date: markDate
      };
      
      if (editingMark) {
        // Update existing mark
        await axios.put(
          `http://localhost:8080/api/marks/${editingMark}`,
          markData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Mark updated successfully");
      } else {
        // Add new mark
        await axios.post(
          `http://localhost:8080/api/classroom/${classroom_Id}/marks`,
          markData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Mark added successfully");
      }
      
      // Reset form
      setMarkTitle("");
      setMarkType("assignment");
      setScore("");
      setMaxScore("");
      setSelectedStudent(null);
      setEditingMark(null);
      
      // Refresh marks
      const marksResponse = await axios.get(
        `http://localhost:8080/api/classroom/${classroom_Id}/marks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMarks(marksResponse.data.marks || []);
    } catch (error) {
      console.error("Error adding/updating mark", error);
      alert(`Failed to add/update mark: ${error.response?.data?.error || error.message}`);
    }
  };
  
  const handleEditMark = (mark) => {
    setEditingMark(mark.id);
    setMarkTitle(mark.title);
    setMarkType(mark.type);
    setScore(mark.score.toString());
    setMaxScore(mark.max_score.toString());
    setSelectedStudent(mark.student_id.toString());
    setMarkDate(mark.date);
  };
  
  const handleDeleteMark = async (markId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/marks/${markId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Remove deleted mark from the state
      setMarks(marks.filter((mark) => mark.id !== markId));
      alert("Mark deleted successfully");
    } catch (error) {
      console.error("Error deleting mark", error);
      alert(`Failed to delete mark: ${error.response?.data?.error || error.message}`);
    }
  };
  
  const cancelEditMark = () => {
    setEditingMark(null);
    setMarkTitle("");
    setMarkType("assignment");
    setScore("");
    setMaxScore("");
    setSelectedStudent(null);
    setMarkDate(new Date().toISOString().split("T")[0]);
  };

  const renderAttendanceForm = () => {
    return students.map((student) => (
      <div key={student.student_id || student.id} className="attendance-form-row">
        <label>
          {student.name} (ID: {student.student_id || student.id})
        </label>
        <select
          value={attendanceData[student.student_id || student.id] || ""}
          onChange={(e) => handleAttendanceChange(student.student_id || student.id, e.target.value)}
          className="form-select ms-2"
        >
          <option value="">Select Status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
      </div>
    ));
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
          .form-control, .form-select {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
          }
          .form-control:focus, .form-select:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          }
          .btn-primary {
            background-color: #4f46e5;
            border-color: #4f46e5;
          }
          .btn-primary:hover {
            background-color: #4338ca;
            border-color: #4338ca;
          }
          .btn-danger {
            background-color: #ef4444;
            border-color: #ef4444;
          }
          .btn-danger:hover {
            background-color: #dc2626;
            border-color: #dc2626;
          }
          .btn-outline-primary {
            color: #4f46e5;
            border-color: #4f46e5;
          }
          .btn-outline-primary:hover {
            background-color: #4f46e5;
            border-color: #4f46e5;
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
          .attendance-status {
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: all 0.2s ease;
          }
          .attendance-status.selected {
            background-color: #4f46e5;
            color: white;
          }
          .attendance-status:hover:not(.selected) {
            background-color: #e5e7eb;
          }
          .attendance-form-row {
            display: flex;
            align-items: center;
            margin-bottom: 0.75rem;
            padding: 0.5rem;
            border-radius: 0.5rem;
            background-color: #f9fafb;
          }
          .attendance-form-row label {
            flex: 1;
            margin-bottom: 0;
          }
          .attendance-form-row select {
            width: 120px;
          }
          .mark-row {
            background-color: #f9fafb;
            border-radius: 8px;
            margin-bottom: 8px;
            padding: 12px;
            transition: all 0.2s ease;
          }
          .mark-row:hover {
            background-color: #f3f4f6;
          }
          .mark-percentage {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .mark-percentage.excellent {
            background-color: #10b981;
            color: white;
          }
          .mark-percentage.good {
            background-color: #3b82f6;
            color: white;
          }
          .mark-percentage.average {
            background-color: #f59e0b;
            color: white;
          }
          .mark-percentage.poor {
            background-color: #ef4444;
            color: white;
          }
        `}
      </style>

      <div className="container py-5">
        {/* Classroom Header */}
        {classroom ? (
          <div className="classroom-header text-white p-4 mb-4">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                <FaChalkboardTeacher size={24} />
              </div>
              <div>
                <h1 className="mb-1 fw-bold">{classroom.name}</h1>
                <div className="d-flex align-items-center">
                  <span className="me-3">Teacher ID: {classroom.teacher_id}</span>
                  <span className="badge bg-white text-primary">Code: {classroom.code}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm p-4 mb-4">
            <div className="d-flex align-items-center">
              <div className="spinner-border text-primary me-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mb-0">Loading classroom details...</p>
            </div>
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
              <FaUserCheck className="me-2" /> Attendance
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "marks" ? "active" : ""}`}
              onClick={() => setActiveTab("marks")}
            >
              <FaChartBar className="me-2" /> Marks
            </button>
          </li>
        </ul>

        {/* Notes Section */}
        {activeTab === "notes" && (
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="card content-card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0 fw-bold">Create New Note</h5>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleCreateNote}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Enter note title"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Content</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Enter note content"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">File URL (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={noteFileUrl}
                        onChange={(e) => setNoteFileUrl(e.target.value)}
                        placeholder="Enter file URL"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    >
                      <FaPlus className="me-2" /> Create Note
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <h5 className="fw-bold mb-3">Existing Notes</h5>
              {notes && notes.length > 0 ? (
                <div className="row g-4">
                  {notes.map((note) => (
                    <div className="col-md-6" key={note.note_id}>
                      <div className="card note-card border-0 shadow-sm h-100">
                        <div className="card-header py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">{note.title}</h6>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNote(note.note_id)}>
                              <FaTrash />
                            </button>
                          </div>
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
                    <p className="mb-0">No notes available. Create your first note!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments Section */}
        {activeTab === "assignments" && (
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="card content-card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0 fw-bold">Create New Assignment</h5>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleCreateAssignment}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={assignmentTitle}
                        onChange={(e) => setAssignmentTitle(e.target.value)}
                        placeholder="Enter assignment title"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Description</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={assignmentDescription}
                        onChange={(e) => setAssignmentDescription(e.target.value)}
                        placeholder="Enter assignment description"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Due Date</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={assignmentDueDate}
                        onChange={(e) => setAssignmentDueDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">File URL (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={assignmentFileUrl}
                        onChange={(e) => setAssignmentFileUrl(e.target.value)}
                        placeholder="Enter file URL"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    >
                      <FaPlus className="me-2" /> Create Assignment
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <h5 className="fw-bold mb-3">Existing Assignments</h5>
              {assignments && assignments.length > 0 ? (
                <div className="row g-4">
                  {assignments.map((assignment) => (
                    <div className="col-md-6" key={assignment.assignment_id}>
                      <div className="card assignment-card border-0 shadow-sm h-100">
                        <div className="card-header py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">{assignment.title}</h6>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteAssignment(assignment.assignment_id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="card-body p-3">
                          <p className="card-text">{assignment.description}</p>
                          <div className="d-flex align-items-center mb-3">
                            <span className="due-date-badge">
                              Due: {new Date(assignment.due_date).toLocaleString()}
                            </span>
                          </div>
                          {assignment.file_url && (
                            <a
                              href={assignment.file_url}
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
                    <FaClipboardList size={48} className="text-muted mb-3" />
                    <p className="mb-0">No assignments available. Create your first assignment!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Section */}
        {activeTab === "attendance" && (
          <div className="row">
            <div className="col-12">
              <div className="card content-card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0 fw-bold">Mark Attendance</h5>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-medium">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      style={{ maxWidth: "300px" }}
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>

                  {students.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student.student_id || student.id}>
                              <td>{student.student_id || student.id}</td>
                              <td>{student.name}</td>
                              <td>
                                <select
                                  className="form-select"
                                  value={attendanceData[student.student_id || student.id] || ""}
                                  onChange={(e) => handleAttendanceChange(student.student_id || student.id, e.target.value)}
                                >
                                  <option value="">Select Status</option>
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Late">Late</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info">No students enrolled in this classroom yet.</div>
                  )}

                  {students.length > 0 && (
                    <div className="mt-4">
                      <button className="btn btn-primary" onClick={handleSubmitAttendance}>
                        Submit Attendance
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marks Section */}
        {activeTab === "marks" && (
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="card content-card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0 fw-bold">
                    {editingMark ? "Edit Mark" : "Add New Mark"}
                  </h5>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleAddMark}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Student</label>
                      <select
                        className="form-select"
                        value={selectedStudent || ""}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        required
                      >
                        <option value="">Select Student</option>
                        {students.map((student) => (
                          <option key={student.student_id || student.id} value={student.student_id || student.id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={markTitle}
                        onChange={(e) => setMarkTitle(e.target.value)}
                        placeholder="E.g., Midterm Exam, Assignment 1"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Type</label>
                      <select
                        className="form-select"
                        value={markType}
                        onChange={(e) => setMarkType(e.target.value)}
                        required
                      >
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                        <option value="exam">Exam</option>
                        <option value="project">Project</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Score</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="Score"
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Max Score</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="form-control"
                          value={maxScore}
                          onChange={(e) => setMaxScore(e.target.value)}
                          placeholder="Max Score"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={markDate}
                        onChange={(e) => setMarkDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="d-flex gap-2">
                      {editingMark ? (
                        <>
                          <button type="submit" className="btn btn-primary flex-grow-1">
                            Update Mark
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={cancelEditMark}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button type="submit" className="btn btn-primary w-100">
                          Add Mark
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <h5 className="fw-bold mb-3">Student Marks</h5>
              {marks && marks.length > 0 ? (
                <div className="card content-card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Score</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marks.map((mark) => {
                            const percentage = (mark.score / mark.max_score) * 100;
                            let percentageClass = "poor";
                            if (percentage >= 90) percentageClass = "excellent";
                            else if (percentage >= 70) percentageClass = "good";
                            else if (percentage >= 50) percentageClass = "average";
                            
                            return (
                              <tr key={mark.id} className="mark-row">
                                <td>{mark.name}</td>
                                <td>{mark.title}</td>
                                <td className="text-capitalize">{mark.type}</td>
                                <td>
                                  <span className={`mark-percentage ${percentageClass}`}>
                                    {mark.score}/{mark.max_score} ({percentage.toFixed(1)}%)
                                  </span>
                                </td>
                                <td>{new Date(mark.date).toLocaleDateString()}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button 
                                      className="btn btn-sm btn-outline-primary" 
                                      onClick={() => handleEditMark(mark)}
                                    >
                                      <FaPencilAlt />
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-danger" 
                                      onClick={() => handleDeleteMark(mark.id)}
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card content-card border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <FaChartBar size={48} className="text-muted mb-3" />
                    <p className="mb-0">No marks recorded yet. Add your first mark!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomPage;