import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

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
  const [noteFileUrl, setNoteFileUrl] = useState(""); // Change to file URL
  const [assignmentFileUrl, setAssignmentFileUrl] = useState(""); // Change to file URL

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        const classroomResponse = await axios.get(`http://localhost:8080/api/classroom/${classroom_Id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClassroom(classroomResponse.data.classroom);

        const notesResponse = await axios.get(`http://localhost:8080/api/classroom/${classroom_Id}/notes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotes(notesResponse.data.notes || []);

        const assignmentsResponse = await axios.get(`http://localhost:8080/api/classroom/${classroom_Id}/assignments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAssignments(assignmentsResponse.data.assignments || []);
      } catch (error) {
        console.error("Error fetching classroom data", error);
      }
    };

    fetchClassroomData();
  }, [classroom_Id, token]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("classroom_id", classroom_Id);
    formData.append("title", noteTitle);
    formData.append("content", noteContent);
    formData.append("file_url", noteFileUrl); // Use file_url instead of file

    try {
      await axios.post(`http://localhost:8080/api/classroom/${classroom_Id}/notes/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setNoteTitle("");
      setNoteContent("");
      setNoteFileUrl(""); // Clear URL input

      const notesResponse = await axios.get(`http://localhost:8080/api/classroom/${classroom_Id}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(notesResponse.data.notes || []);
    } catch (error) {
      console.error("Error creating note", error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("classroom_id", classroom_Id);
    formData.append("title", assignmentTitle);
    formData.append("description", assignmentDescription);
    formData.append("due_date", assignmentDueDate);
    formData.append("file_url", assignmentFileUrl); // Use file_url instead of file

    try {
      await axios.post(`http://localhost:8080/api/classroom/${classroom_Id}/assignments/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
      setAssignmentFileUrl(""); // Clear URL input

      const assignmentsResponse = await axios.get(`http://localhost:8080/api/classroom/${classroom_Id}/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAssignments(assignmentsResponse.data.assignments || []);
    } catch (error) {
      console.error("Error creating assignment", error);
    }
  };

  return (
    <div className="classroom-page">
      {classroom ? (
        <div>
          <h1>{classroom.name}</h1>
          <p>Teacher ID: {classroom.teacher_id}</p>
          <p>Classroom Code: {classroom.code}</p>
        </div>
      ) : (
        <p>Loading classroom details...</p>
      )}

      {/* Notes Section */}
      <div className="notes-section">
        <h2>Notes</h2>
        <form onSubmit={handleCreateNote}>
          <div>
            <label>Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Content</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label>File URL</label>
            <input
              type="text"
              value={noteFileUrl}
              onChange={(e) => setNoteFileUrl(e.target.value)} // Set the URL
            />
          </div>
          <button type="submit">Create Note</button>
        </form>

        <h3>Existing Notes</h3>
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.note_id}>
              <h4>{note.title}</h4>
              <p>{note.content}</p>
              {note.file_url && <a href={note.file_url} target="_blank" rel="noopener noreferrer">Download File</a>}
            </div>
          ))
        ) : (
          <p>No notes available</p>
        )}
      </div>

      {/* Assignments Section */}
      <div className="assignments-section">
        <h2>Assignments</h2>
        <form onSubmit={handleCreateAssignment}>
          <div>
            <label>Title</label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Due Date</label>
            <input
              type="datetime-local"
              value={assignmentDueDate}
              onChange={(e) => setAssignmentDueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>File URL</label>
            <input
              type="text"
              value={assignmentFileUrl}
              onChange={(e) => setAssignmentFileUrl(e.target.value)} // Set the URL
            />
          </div>
          <button type="submit">Create Assignment</button>
        </form>

        <h3>Existing Assignments</h3>
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment.assignment_id}>
              <h4>{assignment.title}</h4>
              <p>{assignment.description}</p>
              <p>Due Date: {assignment.due_date}</p>
              {assignment.file_url && <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">Download File</a>}
            </div>
          ))
        ) : (
          <p>No assignments available</p>
        )}
      </div>
    </div>
  );
};

export default ClassroomPage;
