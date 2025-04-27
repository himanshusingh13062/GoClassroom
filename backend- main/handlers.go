package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Student struct {
	ID           int    `json:"id"`
	EnrollmentNo string `json:"enrollment_no"`
	Name         string `json:"name"`
	YearID       int    `json:"year_id"`
}

type Teacher struct {
	ID          int    `json:"id"`
	TeacherCode string `json:"teacher_code"`
	Name        string `json:"name"`
	Designation string `json:"designation"`
}

type Attendance struct {
	ID        int    `json:"id"`
	StudentID int    `json:"student_id"`
	Date      string `json:"date"`
	Status    string `json:"status"`
}

func homePage(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Welcome to the GradeTrack API"})
}

func createStudent(c *gin.Context) {
	var student Student
	if err := c.BindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	query := `INSERT INTO students (user_id, enrollment_no, name, year_id) VALUES (?, ?, ?, ?)`
	result, err := db.Exec(query, student.ID, student.EnrollmentNo, student.Name, student.YearID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	lastInsertID, _ := result.LastInsertId()
	student.ID = int(lastInsertID)
	c.JSON(http.StatusOK, student)
}
func createTeacher(c *gin.Context) {
	var teacher Teacher
	if err := c.BindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	query := `INSERT INTO teachers (user_id, teacher_code, name, designation) VALUES (?, ?, ?, ?)`
	result, err := db.Exec(query, teacher.ID, teacher.TeacherCode, teacher.Name, teacher.Designation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	lastInsertID, _ := result.LastInsertId()
	teacher.ID = int(lastInsertID)
	c.JSON(http.StatusOK, teacher)
}

func getAllStudents(c *gin.Context) {
	rows, err := db.Query(`SELECT student_id, enrollment_no, name, year_id FROM students`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query students"})
		return
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		var s Student
		if err := rows.Scan(&s.ID, &s.EnrollmentNo, &s.Name, &s.YearID); err == nil {
			students = append(students, s)
		}
	}
	c.JSON(http.StatusOK, students)
}

func getAllTeachers(c *gin.Context) {
	rows, err := db.Query(`SELECT teacher_id, teacher_code, name, designation FROM teachers`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query teachers"})
		return
	}
	defer rows.Close()

	var teachers []Teacher
	for rows.Next() {
		var t Teacher
		if err := rows.Scan(&t.ID, &t.TeacherCode, &t.Name, &t.Designation); err == nil {
			teachers = append(teachers, t)
		}
	}
	c.JSON(http.StatusOK, teachers)
}

func getStudentByID(c *gin.Context) {
	id := c.Param("id")
	var s Student
	err := db.QueryRow(`SELECT student_id, enrollment_no, name, year_id FROM students WHERE student_id = ?`, id).
		Scan(&s.ID, &s.EnrollmentNo, &s.Name, &s.YearID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	c.JSON(http.StatusOK, s)
}

func getTeacherByID(c *gin.Context) {
	id := c.Param("id")
	var t Teacher
	err := db.QueryRow(`SELECT teacher_id, teacher_code, name, designation FROM teachers WHERE user_id = ?`, id).
		Scan(&t.ID, &t.TeacherCode, &t.Name, &t.Designation)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	c.JSON(http.StatusOK, t)
}


func markAttendance(c *gin.Context) {
	var a Attendance
	if err := c.BindJSON(&a); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	_, err := db.Exec(`INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)`,
		a.StudentID, a.Date, a.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Attendance insert failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Attendance marked"})
}

// GET /students/:id/attendance
func getAttendanceByStudentID(c *gin.Context) {
	id := c.Param("id")
	rows, err := db.Query(`SELECT id, student_id, date, status FROM attendance WHERE student_id = ?`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attendance"})
		return
	}
	defer rows.Close()

	var records []Attendance
	for rows.Next() {
		var a Attendance
		if err := rows.Scan(&a.ID, &a.StudentID, &a.Date, &a.Status); err == nil {
			records = append(records, a)
		}
	}
	if len(records) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No attendance found"})
		return
	}
	c.JSON(http.StatusOK, records)
}
