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
	//	api.GET("/students/:id/attendance", getAttendanceByStudentID)

	// Teachers routes
	api.GET("/teachers", getAllTeachers)
	api.GET("/teachers/:id", getTeacherByID)

	// Attendance
	//api.POST("/attendance", markAttendance)

	// Classroom Routes
	api.POST("/classroom/create", CreateClassroom(db))
	api.GET("/classroom/teacher/:teacher_id", GetTeacherClassrooms(db))
	api.GET("/classroom/:classroom_Id", GetClassroomByID(db)) //  -> conflictimg ewit the student getcalsssom handle
	//api.GET("/teacher/classroom/:classroom_id", GetClassroomByID(db)) // this is for teacher view
	api.POST("/classroom/join", JoinClassroom(db))

	// Assignment Routes
	api.POST("/classroom/:classroom_Id/assignments", CreateAssignmentForClassroom(db))
	api.GET("/classroom/:classroom_Id/assignments", GetAssignmentsForClassroom(db))

	// Notes Routes
	api.GET("/classroom/:classroom_Id/notes", GetNotesForClassroom(db))
	api.POST("/classroom/:classroom_Id/notes", CreateNoteForClassroom(db))

	// Deletion handles
	api.DELETE("/classroom/:classroom_id/assignments/:assignment_id", DeleteAssignmentForClassroom(db))
	api.DELETE("/classroom/:classroom_id/notes/:note_id", DeleteNoteForClassroom(db))

	//attendace
	api.POST("/attendance", AssignAttendance)

	// getting attendace for students
	api.GET("/students/:id/classrooms", GetStudentClassrooms(db))

	//student calssroom data reteriving
	//api.GET("/classroom/:classroom_Id", GetStudentClassroomByID(db))
	api.GET("/student/classroom/:classroom_Id", GetStudentClassroomByID(db))

	// notes download by the student  -- this is working without handle too i think,this need soem more work
	api.GET("/classroom/:classroom_Id/note/:note_id/download", GetNoteFile(db))

	// teacher classroom students list for attendace
	api.GET("/classroom/:classroom_Id/students", GetStudentsByClassroom(db))
	// http://localhost:8080/api/classroom/3/students

	api.GET("/students/:id/attendance", GetAttendanceByStudentID(db))

	// Marks/Performance routes for teachers
	api.POST("/classroom/:classroom_Id/marks", AddStudentMarks(db))
	api.GET("/classroom/:classroom_Id/marks", GetClassroomMarks(db))
	api.PUT("/marks/:mark_id", UpdateStudentMarks(db))
	api.DELETE("/marks/:mark_id", DeleteStudentMarks(db))

	// Marks/Performance routes for students
	api.GET("/students/:id/classroom/:classroom_Id/marks", GetStudentMarks(db))
	api.GET("/students/:id/performance", GetStudentOverallPerformance(db))

	// Start server
	if err := r.Run(":8080"); err != nil {
		fmt.Println("Server error:", err)
	}
}
