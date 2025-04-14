import React, { useEffect, useState } from "react";
import axios from "axios";

const TeacherPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8080/admin/files").then((res) => {
      setFiles(res.data);
    });
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", selectedFile);

    axios.post("http://localhost:8080/admin/upload", formData).then(() => {
      alert("File uploaded!");
      window.location.reload();
    });
  };

  const handleDelete = (file) => {
    axios.delete(`http://localhost:8080/admin/files/${file}`).then(() => {
      alert("File deleted!");
      window.location.reload();
    });
  };

  return (
    <div className="container mt-5">
      <h2>Teacher Dashboard</h2>

      <h4>Upload Notes</h4>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
        <button type="submit" className="btn btn-primary">Upload</button>
      </form>

      <h4>Manage Files</h4>
      <ul className="list-group">
        {files.map((file, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            {file}
            <button className="btn btn-danger" onClick={() => handleDelete(file)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherPage;
