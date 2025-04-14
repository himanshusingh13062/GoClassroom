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

	// Connect without specifying database
	dbRoot, err := sql.Open("mysql", "root:abcd1234@tcp(localhost:3306)/")
	if err != nil {
		log.Fatal("Connection error (root): ", err)
	}
	defer dbRoot.Close()

	// Create database if it doesn't exist
	_, err = dbRoot.Exec("CREATE DATABASE IF NOT EXISTS go_classroom")
	if err != nil {
		log.Fatal("Error creating database: ", err)
	}

	// Connect to the database
	db, err = sql.Open("mysql", "root:abcd1234@tcp(localhost:3306)/go_classroom")
	if err != nil {
		log.Fatal("Database connection error: ", err)
	}

	// Create students table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS students (
			id INT AUTO_INCREMENT PRIMARY KEY,
			first_name VARCHAR(100) NOT NULL,
			last_name VARCHAR(100) NOT NULL,
			email VARCHAR(100) NOT NULL UNIQUE,
			phone VARCHAR(15),
			dob DATE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal("Error creating students table: ", err)
	}

	// Create teachers table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS teachers (
			id INT AUTO_INCREMENT PRIMARY KEY,
			first_name VARCHAR(100) NOT NULL,
			last_name VARCHAR(100) NOT NULL,
			email VARCHAR(100) NOT NULL UNIQUE,
			phone VARCHAR(15),
			dob DATE,
			teacher_id VARCHAR(100) NOT NULL,
			designation VARCHAR(100),
			department VARCHAR(100),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal("Error creating teachers table: ", err)
	}

	// Create attendance table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS attendance (
			id INT AUTO_INCREMENT PRIMARY KEY,
			student_id INT NOT NULL,
			date DATE NOT NULL,
			status ENUM('Present', 'Absent', 'Late') NOT NULL,
			FOREIGN KEY(student_id) REFERENCES students(id)
		)
	`)
	if err != nil {
		log.Fatal("Error creating attendance table: ", err)
	}
}


func main() {
	initDB()
	defer db.Close()

	r := gin.Default()

	// Routes
	r.GET("/", homePage)

	// Students
	r.POST("/student", createStudent)
	r.GET("/students", getAllStudents)
	r.GET("/students/:id", getStudentByID)
	r.GET("/students/:id/attendance", getAttendanceByStudentID)

	// Teachers
	r.POST("/teacher", createTeacher)
	r.GET("/teachers", getAllTeachers)
	r.GET("/teachers/:id", getTeacherByID)

	// Attendance
	r.POST("/attendance", markAttendance)

	// Run server
	if err := r.Run(":8080"); err != nil {
		fmt.Printf("Server error: %v\n", err)
	}
}
