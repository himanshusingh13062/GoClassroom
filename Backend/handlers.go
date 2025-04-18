package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Student struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone,omitempty"`
	DOB       string `json:"dob,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
}

type Teacher struct {
	ID          int    `json:"id"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Email       string `json:"email"`
	Phone       string `json:"phone,omitempty"`
	DOB         string `json:"dob,omitempty"`
	TeacherID   string `json:"teacher_id"`
	Designation string `json:"designation"`
	Department  string `json:"department"`
	CreatedAt   string `json:"created_at,omitempty"`
}

type Attendance struct {
	ID        int    `json:"id"`
	StudentID int    `json:"student_id"`
	Date      string `json:"date"`
	Status    string `json:"status"`
}

func homePage(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Welcome to the Student Performance API"})
}

// POST /student
func createStudent(c *gin.Context) {
	var student Student
	if err := c.BindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	query := `INSERT INTO students (first_name, last_name, email, phone, dob) VALUES (?, ?, ?, ?, ?)`
	result, err := db.Exec(query, student.FirstName, student.LastName, student.Email, student.Phone, student.DOB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	lastInsertID, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch last inserted ID"})
		return
	}

	student.ID = int(lastInsertID)
	c.JSON(http.StatusOK, student)
}

// POST /teacher
func createTeacher(c *gin.Context) {
	var teacher Teacher
	if err := c.BindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	query := `INSERT INTO teachers (first_name, last_name, email, phone, dob, teacher_id, designation, department) 
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := db.Exec(query, teacher.FirstName, teacher.LastName, teacher.Email, teacher.Phone, teacher.DOB,
		teacher.TeacherID, teacher.Designation, teacher.Department)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	lastInsertID, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch last inserted ID"})
		return
	}

	teacher.ID = int(lastInsertID)
	c.JSON(http.StatusOK, teacher)
}

// GET /students
func getAllStudents(c *gin.Context) {
	rows, err := db.Query("SELECT id, first_name, last_name, email, phone, dob, created_at FROM students")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query students"})
		return
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		var s Student
		if err := rows.Scan(&s.ID, &s.FirstName, &s.LastName, &s.Email, &s.Phone, &s.DOB, &s.CreatedAt); err != nil {
			continue
		}
		students = append(students, s)
	}
	c.JSON(http.StatusOK, students)
}

// GET /teachers
func getAllTeachers(c *gin.Context) {
	rows, err := db.Query("SELECT id, first_name, last_name, email, phone, dob, teacher_id, designation, department, created_at FROM teachers")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query teachers"})
		return
	}
	defer rows.Close()

	var teachers []Teacher
	for rows.Next() {
		var t Teacher
		if err := rows.Scan(&t.ID, &t.FirstName, &t.LastName, &t.Email, &t.Phone, &t.DOB, &t.TeacherID, &t.Designation, &t.Department, &t.CreatedAt); err != nil {
			continue
		}
		teachers = append(teachers, t)
	}
	c.JSON(http.StatusOK, teachers)
}

// POST /attendance
func markAttendance(c *gin.Context) {
	var a Attendance
	if err := c.BindJSON(&a); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	query := `INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)`
	_, err := db.Exec(query, a.StudentID, a.Date, a.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendance marked successfully"})
}

// GET /students/:id
func getStudentByID(c *gin.Context) {
	id := c.Param("id")

	var student Student
	err := db.QueryRow("SELECT id, first_name, last_name, email, phone, dob, created_at FROM students WHERE id = ?", id).
		Scan(&student.ID, &student.FirstName, &student.LastName, &student.Email, &student.Phone, &student.DOB, &student.CreatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	c.JSON(http.StatusOK, student)
}

// GET /teachers/:id
func getTeacherByID(c *gin.Context) {
	id := c.Param("id")

	var teacher Teacher
	err := db.QueryRow("SELECT id, first_name, last_name, email, phone, dob, teacher_id, designation, department, created_at FROM teachers WHERE id = ?", id).
		Scan(&teacher.ID, &teacher.FirstName, &teacher.LastName, &teacher.Email, &teacher.Phone, &teacher.DOB, &teacher.TeacherID, &teacher.Designation, &teacher.Department, &teacher.CreatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	c.JSON(http.StatusOK, teacher)
}

// GET /students/:id/attendance
func getAttendanceByStudentID(c *gin.Context) {
	id := c.Param("id")
	rows, err := db.Query("SELECT id, student_id, date, status FROM attendance WHERE student_id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query error"})
		return
	}
	defer rows.Close()

	var attendances []Attendance
	for rows.Next() {
		var a Attendance
		err := rows.Scan(&a.ID, &a.StudentID, &a.Date, &a.Status)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning attendance"})
			return
		}
		attendances = append(attendances, a)
	}

	if len(attendances) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No attendance records found"})
		return
	}

	c.JSON(http.StatusOK, attendances)
}

