package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func initDB() {
	var err error

	dbRoot, err := sql.Open("mysql", "root:abcd1234@tcp(localhost:3306)/")
	if err != nil {
		log.Fatal("Connection error (root): ", err)
	}
	defer dbRoot.Close()

	_, err = dbRoot.Exec("CREATE DATABASE IF NOT EXISTS go_classroom_ver3")
	if err != nil {
		log.Fatal("Error creating database: ", err)
	}

	db, err = sql.Open("mysql", "root:abcd1234@tcp(localhost:3306)/go_classroom_ver3")
	if err != nil {
		log.Fatal("Database connection error: ", err)
	}

	queries := []string{
		`CREATE TABLE IF NOT EXISTS classrooms (
			classroom_id INT AUTO_INCREMENT PRIMARY KEY,
			teacher_id INT NOT NULL,
			name VARCHAR(255) NOT NULL,
			code VARCHAR(6) NOT NULL UNIQUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS years (
			year_id INT AUTO_INCREMENT PRIMARY KEY,
			year_name VARCHAR(50) NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS users (
			user_id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(50) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			user_type ENUM('student', 'teacher') NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS students (
			student_id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT UNIQUE NOT NULL,
			enrollment_no VARCHAR(20) UNIQUE NOT NULL,
			name VARCHAR(100) NOT NULL,
			year_id INT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS teachers (
			teacher_id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT UNIQUE NOT NULL,
			teacher_code VARCHAR(20) UNIQUE NOT NULL,
			name VARCHAR(100) NOT NULL,
			designation VARCHAR(100) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS attendance (
			id INT AUTO_INCREMENT PRIMARY KEY,
			student_id INT,
			date DATE,
			status ENUM('Present', 'Absent', 'Late') NOT NULL,
			FOREIGN KEY(student_id) REFERENCES students(student_id)
		)`,
		`CREATE TABLE IF NOT EXISTS assignments (
			assignment_id INT AUTO_INCREMENT PRIMARY KEY,
			classroom_id INT NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			due_date DATETIME NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
		)`,
	}

	for _, query := range queries {
		_, err = db.Exec(query)
		if err != nil {
			log.Fatal("Table creation error:", err)
		}
	}
}

func main() {
    initDB()
    defer db.Close()

    r := gin.Default()
    r.Use(CORSMiddleware())

    // Public routes
    r.GET("/", homePage)
    r.POST("/signup", signup)
    r.POST("/login", login)
    r.POST("/student", createStudent)
    r.POST("/teacher", createTeacher)

    // Protected routes using JWT middleware
    api := r.Group("/api")
    api.Use(AuthMiddleware())

    // Students routes
    api.GET("/students", getAllStudents)
    api.GET("/students/:id", getStudentByID)
    api.GET("/students/:id/attendance", getAttendanceByStudentID)

    // Teachers routes
    api.GET("/teachers", getAllTeachers)
    api.GET("/teachers/:id", getTeacherByID)

    // Attendance
    api.POST("/attendance", markAttendance)

    // Classroom Routes
    api.POST("/classroom/create", CreateClassroom(db))                   // Create classroom
    api.GET("/classroom/teacher/:teacher_id", GetTeacherClassrooms(db))  // Get teacher classrooms
    api.GET("/classroom/:classroom_id", GetClassroomByID(db))            // Get a single classroom
    api.POST("/classroom/join", JoinClassroom(db))                       // Join a classroom

    // Assignment Routes
    api.POST("/classroom/:classroom_id/assignments", CreateAssignmentForClassroom(db)) // Create assignment
    api.GET("/classroom/:classroom_id/assignments", GetAssignmentsForClassroom(db))     // Get assignments for classroom

    // Notes Routes
    api.GET("/classroom/:classroom_id/notes", GetNotesForClassroom(db))         // Get notes for classroom
    api.POST("/classroom/:classroom_id/notes", CreateNoteForClassroom(db))      // Create note for classroom
    //api.POST("/classroom/:classroom_id/notes/upload", UploadNoteFile)           // Upload note file

    // Assignment File Upload Route
    api.POST("/classroom/:classroom_id/assignments/upload", UploadAssignmentFile) // Upload assignment file


    // Start server
    if err := r.Run(":8080"); err != nil {
        fmt.Println("Server error:", err)
    }
}

