package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func main() {
	// Initialize database
	initDB()

	// Initialize router
	router := gin.Default()

	// Routes
	router.GET("/", homePage)
	router.POST("/student", createStudent)
	router.GET("/students", getAllStudents)
	router.POST("/attendance", markAttendance)
	router.GET("/students/:id", getStudentByID)
	router.GET("/students/:id/attendance", getAttendanceByStudentID)


	// Run server
	router.Run(":8000")
}

func initDB() {
	var err error
	// Connect to MySQL without specifying DB first  --  chnage your password according to your mysql 
	db, err = sql.Open("mysql", "root:abcd1234@tcp(localhost:3306)/")
	if err != nil {
		log.Fatal("DB Connect Error:", err)
	}

	// Create database if not exists
	_, err = db.Exec("CREATE DATABASE IF NOT EXISTS go_classroom")
	if err != nil {
		log.Fatal("DB Creation Error:", err)
	}

	// Connect to the actual DB
	db, err = sql.Open("mysql", "root:abcd1234@tcp(localhost:3306)/go_classroom")
	if err != nil {
		log.Fatal("DB Select Error:", err)
	}

	// Create students table
	createStudentsTable := `
	CREATE TABLE IF NOT EXISTS students (
		id INT AUTO_INCREMENT PRIMARY KEY,
		first_name VARCHAR(100) NOT NULL,
		last_name VARCHAR(100) NOT NULL,
		email VARCHAR(100) NOT NULL UNIQUE,
		phone VARCHAR(15),
		dob DATE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`
	_, err = db.Exec(createStudentsTable)
	if err != nil {
		log.Fatal("Table Creation Error (students):", err)
	}

	// Create attendance table
	createAttendanceTable := `
	CREATE TABLE IF NOT EXISTS attendance (
		id INT AUTO_INCREMENT PRIMARY KEY,
		student_id INT,
		date DATE,
		status ENUM('Present', 'Absent', 'Late') NOT NULL,
		FOREIGN KEY (student_id) REFERENCES students(id)
	)`
	_, err = db.Exec(createAttendanceTable)
	if err != nil {
		log.Fatal("Table Creation Error (attendance):", err)
	}

	fmt.Println("Database and tables ready.")
}
