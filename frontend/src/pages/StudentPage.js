import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentPage = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/student/files").then((res) => {
      setFiles(res.data);
    });
  }, []);

  return (
    <div className="container mt-5">
      <h2>Student Dashboard</h2>
      <h4>Download Notes</h4>
      <ul className="list-group">
        {files.map((file, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            {file}
            <a href={`http://localhost:8080/student/download/${file}`} className="btn btn-success">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentPage;
