package main

import (
	"database/sql"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Classroom struct {
	ID        uint      `json:"id"`
	TeacherID uint      `json:"teacher_id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateClassroomRequest struct {
	TeacherID uint   `json:"teacher_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
}

func generateRandomCode(n int) string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	code := make([]byte, n)
	for i := range code {
		code[i] = letters[rand.Intn(len(letters))]
	}
	return string(code)
}

func CreateClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateClassroomRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		code := generateRandomCode(6)

		createdAt := time.Now().Format("2006-01-02 15:04:05")

		result, err := db.Exec(`
			INSERT INTO classrooms (teacher_id, name, code, created_at)
			VALUES (?, ?, ?, ?)`, req.TeacherID, req.Name, code, createdAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create classroom"})
			fmt.Println(err)
			return
		}

		classroomID, _ := result.LastInsertId()

		c.JSON(http.StatusOK, gin.H{
			"message": "Classroom created successfully",
			"classroom": map[string]interface{}{
				"id":         classroomID,
				"teacher_id": req.TeacherID,
				"name":       req.Name,
				"code":       code,
				"created_at": createdAt,
			},
		})
	}
}

func GetTeacherClassrooms(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		teacherID := c.Param("teacher_id")

		rows, err := db.Query(`
			SELECT id, name, code, created_at
			FROM classrooms
			WHERE teacher_id = ?`, teacherID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classrooms"})
			return
		}
		defer rows.Close()

		var classrooms []Classroom

		for rows.Next() {
			var classroom Classroom
			var createdAtStr string
			if err := rows.Scan(&classroom.ID, &classroom.Name, &classroom.Code, &createdAtStr); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan classrooms"})
				return
			}

			// Convert string date to time.Time type
			classroom.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAtStr)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse date"})
				return
			}

			classrooms = append(classrooms, classroom)
		}

		if len(classrooms) == 0 {
			c.JSON(http.StatusOK, gin.H{"message": "No classrooms found"})
		} else {
			c.JSON(http.StatusOK, gin.H{"classrooms": classrooms})
		}
	}
}

func GetClassroomByID(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomID := c.Param("classroom_Id")

		var classroom Classroom
		var createdAtStr string
		err := db.QueryRow(`
  			SELECT id, teacher_id, name, code, created_at
  			FROM classrooms
  			WHERE id = ?`, classroomID).Scan(&classroom.ID, &classroom.TeacherID, &classroom.Name, &classroom.Code, &createdAtStr)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Classroom not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classroom"})
			}
			return
		}

		classroom.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAtStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse date"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"classroom": classroom,
		})
	}
}

//=======================================  classroom joining =====================================

type JoinClassroomRequest struct {
	StudentID int    `json:"student_id"`
	Code      string `json:"code"`
}

func JoinClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("Received request to join classroom")
		var req struct {
			StudentID int    `json:"student_id"`
			Code      string `json:"code"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		var classroomID int
		err := db.QueryRow("SELECT id FROM classrooms WHERE code = ?", req.Code).Scan(&classroomID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Classroom not found"})
			return
		}

		_, err = db.Exec(`
            INSERT INTO classroom_students (student_id, classroom_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE joined_at = CURRENT_TIMESTAMP`,
			req.StudentID, classroomID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join classroom"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Joined classroom successfully"})
	}
}

// ========================== getting classroom for students ========================================
func GetStudentClassrooms(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentID := c.Param("id")
		if studentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing student ID in URL"})
			return
		}

		query := `
			SELECT c.id, c.name, c.code
			FROM classrooms c
			JOIN classroom_students cs ON c.id = cs.classroom_id
			WHERE cs.student_id = ?
		`

		rows, err := db.Query(query, studentID)
		if err != nil {
			fmt.Printf("Database query error for student ID %s: %v\n", studentID, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to execute classroom query",
				"details": err.Error(),
			})
			return
		}
		defer rows.Close()

		var classrooms []map[string]interface{}
		for rows.Next() {
			var id int
			var name, code string

			if err := rows.Scan(&id, &name, &code); err != nil {
				fmt.Printf("Error scanning row: %v\n", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Failed to scan classroom row",
					"details": err.Error(),
				})
				return
			}

			classrooms = append(classrooms, gin.H{
				"id":   id,
				"name": name,
				"code": code,
			})
		}

		if err := rows.Err(); err != nil {
			fmt.Printf("Row iteration error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error iterating over classroom rows",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, classrooms)
	}
}

// ================================= NOTES HANDLES =================================================

func CreateNoteForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomIDStr := c.Param("classroom_Id")
		fmt.Println("Received classroom ID from URL:", classroomIDStr)
		classroomID, err := strconv.Atoi(classroomIDStr)
		if err != nil {
			fmt.Println("Error: Invalid classroom ID format:", classroomIDStr)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
			return
		}

		fmt.Println("Classroom ID successfully parsed:", classroomID)

		var requestBody struct {
			Title   string `json:"title"`
			Content string `json:"content"`
			FileURL string `json:"file_url"`
		}

		if err := c.ShouldBindJSON(&requestBody); err != nil {
			fmt.Println("Error: Invalid JSON body:", err) // Debug log for invalid JSON
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
			return
		}

		if requestBody.Title == "" || requestBody.Content == "" {
			fmt.Println("Error: Missing required fields (Title or Content)")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
			return
		}

		fmt.Println("Creating note for classroom:", classroomID)
		fmt.Printf("Note data: Title: %s, Content: %s, File URL: %s\n", requestBody.Title, requestBody.Content, requestBody.FileURL)

		_, err = db.Exec(`
            INSERT INTO notes (classroom_Id, title, content, file_url)
            VALUES (?, ?, ?, ?)`,
			classroomID, requestBody.Title, requestBody.Content, requestBody.FileURL,
		)
		if err != nil {
			fmt.Println("Database Error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create note"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Note created successfully"})
	}
}

func GetNotesForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomIDStr := c.Param("classroom_Id")
		classroomID, err := strconv.Atoi(classroomIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
			return
		}

		rows, err := db.Query(`
            SELECT id, title, content, created_at, file_url
            FROM notes WHERE classroom_id = ?`, classroomID)

		if err != nil {
			fmt.Println("Error executing query:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notes"})
			return
		}
		defer rows.Close()

		var notes []map[string]interface{}
		for rows.Next() {
			var note struct {
				NoteID    uint   `json:"note_id"`
				Title     string `json:"title"`
				Content   string `json:"content"`
				CreatedAt string `json:"created_at"`
				FileURL   string `json:"file_url"`
			}
			if err := rows.Scan(&note.NoteID, &note.Title, &note.Content, &note.CreatedAt, &note.FileURL); err != nil {
				fmt.Println("Error scanning row:", err)
				continue
			}

			parsedTime, err := time.Parse("2006-01-02 15:04:05", note.CreatedAt)
			if err != nil {
				fmt.Println("Error parsing created_at:", err)
				continue
			}

			note.CreatedAt = parsedTime.Format(time.RFC3339)

			// Add note to the slice
			notes = append(notes, map[string]interface{}{
				"note_id":    note.NoteID,
				"title":      note.Title,
				"content":    note.Content,
				"created_at": note.CreatedAt,
				"file_url":   note.FileURL,
			})
		}

		if len(notes) == 0 {
			c.JSON(http.StatusOK, gin.H{"notes": []interface{}{}})
			return
		}

		c.JSON(http.StatusOK, gin.H{"notes": notes})
	}
}

// ===================================== ASSIGNMENT HANDLES ======================================

func CreateAssignmentForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ClassroomID   uint   `json:"classroom_id" binding:"required"`
			Title         string `json:"title" binding:"required"`
			Description   string `json:"description" binding:"required"`
			DueDate       string `json:"due_date" binding:"required"`
			AssignmentURL string `json:"file_url"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		if req.AssignmentURL != "" {
			fmt.Println("Received AssignmentURL:", req.AssignmentURL)
			if _, err := url.ParseRequestURI(req.AssignmentURL); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment file URL"})
				return
			}
		} else {
			fmt.Println("No Assignment URL provided, proceeding without validation.")
		}

		_, err := db.Exec(`
			INSERT INTO assignments (classroom_id, title, description, due_date, file_url)
			VALUES (?, ?, ?, ?, ?)`,
			req.ClassroomID, req.Title, req.Description, req.DueDate, req.AssignmentURL)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Assignment created successfully"})
	}
}

func GetAssignmentsForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomID := c.Param("classroom_Id")

		// Updated query to reflect correct column name `assignment_id`
		rows, err := db.Query(`
            SELECT assignment_id, title, description, due_date, created_at, file_url
            FROM assignments WHERE classroom_id = ?`, classroomID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments", "details": err.Error()})
			return
		}
		defer rows.Close()

		var assignments []map[string]interface{}
		for rows.Next() {
			var assignment struct {
				AssignmentID uint      `json:"assignment_id"`
				Title        string    `json:"title"`
				Description  string    `json:"description"`
				DueDate      string    `json:"due_date"`
				CreatedAt    time.Time `json:"created_at"`
				FileURL      string    `json:"file_url"`
			}

			var createdAt []byte
			if err := rows.Scan(&assignment.AssignmentID, &assignment.Title, &assignment.Description, &assignment.DueDate, &createdAt, &assignment.FileURL); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning assignment", "details": err.Error()})
				return
			}

			parsedTime, err := time.Parse("2006-01-02 15:04:05", string(createdAt))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing created_at", "details": err.Error()})
				return
			}
			assignment.CreatedAt = parsedTime

			assignments = append(assignments, map[string]interface{}{
				"assignment_id": assignment.AssignmentID,
				"title":         assignment.Title,
				"description":   assignment.Description,
				"due_date":      assignment.DueDate,
				"created_at":    assignment.CreatedAt,
				"file_url":      assignment.FileURL,
			})
		}

		if len(assignments) == 0 {
			fmt.Println("No assignments found for classroom:", classroomID)
		}

		c.JSON(http.StatusOK, gin.H{"assignments": assignments})
	}
}

// ================================ DELETION HANDLES ==============================================
// ========================== NEED MORE WORK , STILL NOT WORKING
func DeleteNoteForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		noteIDStr := c.Param("note_id")
		noteID, err := strconv.Atoi(noteIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
			return
		}

		_, err = db.Exec(`DELETE FROM notes WHERE id = ?`, noteID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete note"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
	}
}
func DeleteAssignmentForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get parameters
		classroomIDStr := c.Param("classroom_id")
		assignmentIDStr := c.Param("assignment_id")

		fmt.Println("Classroom ID:", classroomIDStr)
		fmt.Println("Assignment ID:", assignmentIDStr)

		assignmentID, err := strconv.Atoi(assignmentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
			return
		}

		classroomID, err := strconv.Atoi(classroomIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
			return
		}

		result, err := db.Exec(`
			DELETE FROM assignments 
			WHERE assignment_id = ? AND classroom_id = ?
		`, assignmentID, classroomID)

		if err != nil {
			fmt.Printf("Failed to delete assignment: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assignment"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found or not in this classroom"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Assignment deleted successfully"})
	}
}

// =================================== TEACHER ATTENCE HANDLES =================================
type AttendanceInput struct {
	ClassroomID int                 `json:"classroom_id"`
	Date        string              `json:"date"` // in "YYYY-MM-DD"
	Records     []StudentAttendance `json:"records"`
}

type StudentAttendance struct {
	StudentID int    `json:"student_id"`
	Status    string `json:"status"` // Present, Absent, Late
}

// Handler for assigning attendance
// Handler for assigning attendance
func AssignAttendance(c *gin.Context) {
	var input AttendanceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		fmt.Println("Invalid input:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Log the received attendance data
	fmt.Println("Received attendance data:", input)

	// Validate classroom ID
	if input.ClassroomID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
		return
	}

	// Validate date format
	if input.Date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date is required"})
		return
	}

	// Validate records
	if len(input.Records) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No attendance records provided"})
		return
	}

	// Loop through each attendance record and insert it into the database
	for _, record := range input.Records {
		// Check if student ID is valid
		if record.StudentID <= 0 {
			fmt.Println("Invalid student ID:", record.StudentID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
			return
		}

		// Validate status
		if record.Status != "Present" && record.Status != "Absent" && record.Status != "Late" {
			fmt.Println("Invalid status:", record.Status)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Must be 'Present', 'Absent', or 'Late'"})
			return
		}

		fmt.Printf("Processing student_id: %d, status: %s\n", record.StudentID, record.Status)

		// Check if student exists in the database
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM students WHERE student_id = ?)", record.StudentID).Scan(&exists)
		if err != nil {
			fmt.Println("Database error checking student:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		if !exists {
			fmt.Println("Student ID does not exist:", record.StudentID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Student ID does not exist"})
			return
		}

		// Insert or update the attendance record
		_, err = db.Exec(`
			INSERT INTO attendance (student_id, date, status)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE status = ?`,
			record.StudentID, input.Date, record.Status, record.Status)

		if err != nil {
			fmt.Println("Error inserting attendance record:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign attendance"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendance assigned successfully"})
}

// =================================== ATTENDACE STUDENTS ============================================
func GetStudentsByClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomID := c.Param("classroom_Id")
		fmt.Println("Received classroomID:", classroomID) // Debugging log

		query := `
            SELECT s.student_id, s.name
            FROM students s
            JOIN classroom_students cs ON s.student_id = cs.student_id
            WHERE cs.classroom_id = ?
        `
		rows, err := db.Query(query, classroomID)
		if err != nil {
			fmt.Println("Database query failed:", err) // Debugging log for the error
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
			return
		}
		defer rows.Close()

		var students []map[string]interface{}
		for rows.Next() {
			var id int
			var name string
			if err := rows.Scan(&id, &name); err != nil {
				fmt.Println("Error reading student row:", err) // Debugging log
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading student row"})
				return
			}
			students = append(students, gin.H{"id": id, "name": name})
		}

		if len(students) == 0 {
			fmt.Println("No students found for classroom:", classroomID) // Debugging log
		}

		c.JSON(http.StatusOK, gin.H{"students": students})
	}
}

//==============================================================================================
//==============================================================================================
//==============================================================================================
// ================================= MARKS/PERFORMANCE HANDLES =================================

type Mark struct {
	ID          int     `json:"id"`
	StudentID   int     `json:"student_id"`
	ClassroomID int     `json:"classroom_id"`
	Title       string  `json:"title"`
	Score       float64 `json:"score"`
	MaxScore    float64 `json:"max_score"`
	Type        string  `json:"type"` // "assignment", "quiz", "exam", etc.
	Date        string  `json:"date"`
}

// Handler for teacher to add marks for a student
func AddStudentMarks(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var mark Mark
		if err := c.ShouldBindJSON(&mark); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		// Validate input
		if mark.StudentID <= 0 || mark.ClassroomID <= 0 || mark.Title == "" || mark.MaxScore <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
			return
		}

		// Check if student exists and is in the classroom
		var exists bool
		err := db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM classroom_students 
				WHERE student_id = ? AND classroom_id = ?
			)`, mark.StudentID, mark.ClassroomID).Scan(&exists)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Student is not enrolled in this classroom"})
			return
		}

		// Insert the mark
		result, err := db.Exec(`
			INSERT INTO marks (student_id, classroom_id, title, score, max_score, type, date)
			VALUES (?, ?, ?, ?, ?, ?, ?)`,
			mark.StudentID, mark.ClassroomID, mark.Title, mark.Score, mark.MaxScore, mark.Type, mark.Date)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add marks"})
			return
		}

		id, _ := result.LastInsertId()
		mark.ID = int(id)

		c.JSON(http.StatusOK, gin.H{
			"message": "Marks added successfully",
			"mark":    mark,
		})
	}
}

// Handler for teacher to update marks for a student
func UpdateStudentMarks(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		markIDStr := c.Param("mark_id")
		markID, err := strconv.Atoi(markIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mark ID"})
			return
		}

		var mark Mark
		if err := c.ShouldBindJSON(&mark); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		// Update the mark
		_, err = db.Exec(`
			UPDATE marks 
			SET title = ?, score = ?, max_score = ?, type = ?, date = ?
			WHERE id = ?`,
			mark.Title, mark.Score, mark.MaxScore, mark.Type, mark.Date, markID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update marks"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Marks updated successfully"})
	}
}

// Handler for teacher to delete marks
func DeleteStudentMarks(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		markIDStr := c.Param("mark_id")
		markID, err := strconv.Atoi(markIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mark ID"})
			return
		}

		_, err = db.Exec("DELETE FROM marks WHERE id = ?", markID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete marks"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Marks deleted successfully"})
	}
}

// Handler for teacher to get all marks for a classroom
func GetClassroomMarks(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomIDStr := c.Param("classroom_Id")
		classroomID, err := strconv.Atoi(classroomIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
			return
		}

		rows, err := db.Query(`
			SELECT m.id, m.student_id, s.name, m.title, m.score, m.max_score, m.type, m.date
			FROM marks m
			JOIN students s ON m.student_id = s.student_id
			WHERE m.classroom_id = ?
			ORDER BY m.date DESC, s.name ASC`, classroomID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marks"})
			return
		}
		defer rows.Close()

		var marks []map[string]interface{}
		for rows.Next() {
			var mark struct {
				ID        int
				StudentID int
				Name      string
				Title     string
				Score     float64
				MaxScore  float64
				Type      string
				Date      string
			}

			if err := rows.Scan(&mark.ID, &mark.StudentID, &mark.Name, &mark.Title, &mark.Score, &mark.MaxScore, &mark.Type, &mark.Date); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning marks"})
				return
			}

			marks = append(marks, map[string]interface{}{
				"id":         mark.ID,
				"student_id": mark.StudentID,
				"name":       mark.Name,
				"title":      mark.Title,
				"score":      mark.Score,
				"max_score":  mark.MaxScore,
				"type":       mark.Type,
				"date":       mark.Date,
				"percentage": (mark.Score / mark.MaxScore) * 100,
			})
		}

		c.JSON(http.StatusOK, gin.H{"marks": marks})
	}
}
