import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link for navigation

const TeacherPage = () => {
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token"); // Get the token from localStorage
      try {
        const res = await axios.get(`http://localhost:8080/api/teachers/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}` // Add Authorization header with token
          }
        });
        setTeacher(res.data);
      } catch (error) {
        console.error("Failed to fetch teacher info:", error);
      }
    };
    fetchTeacher();
  }, []);

  const [classrooms, setClassrooms] = useState([]);
  const [newClassroomName, setNewClassroomName] = useState("");

  useEffect(() => {
    const fetchClassrooms = async () => {
      const teacherId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:8080/api/classroom/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClassrooms(res.data.classrooms);
      } catch (error) {
        console.error("Failed to load classrooms:", error);
      }
    };
    fetchClassrooms();
  }, []);

  const handleCreateClassroom = async () => {
    if (!newClassroomName) return;
    const teacherId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:8080/api/classroom/create", {
        teacher_id: parseInt(teacherId),
        name: newClassroomName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload(); // simple reload after creation
    } catch (error) {
      console.error("Failed to create classroom:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Teacher Dashboard</h2>
      {teacher ? (
        <div className="card p-4 shadow mt-3">
          <p><strong>Name:</strong> {teacher.name}</p>
          <p><strong>Teacher Code:</strong> {teacher.teacher_code}</p>
          <p><strong>Designation:</strong> {teacher.designation}</p>
        </div>
      ) : (
        <p>Loading teacher information...</p>
      )}

      <div>
        <button className="btn btn-danger mt-3" onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}>
          Logout
        </button>
      </div>

      <div className="mt-5">
        <h3>My Classrooms</h3>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter classroom name"
            value={newClassroomName}
            onChange={(e) => setNewClassroomName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreateClassroom}>Create Classroom</button>
        </div>

        {classrooms.length > 0 ? (
          <ul className="list-group">
            {classrooms.map((cls) => (
              <li key={cls.id} className="list-group-item d-flex justify-content-between align-items-center">
                <Link to={`/classroom/${cls.id}`} style={{ textDecoration: "none" }}>
                  {cls.name}
                </Link>
                <span className="badge bg-primary">{cls.code}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No classrooms created yet.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;
