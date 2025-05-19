package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetStudentClassroomByID(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomIDStr := c.Param("classroom_Id")
		classroomID, err := strconv.Atoi(classroomIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
			return
		}

		var classroom struct {
			ID   int    `json:"id"`
			Code string `json:"code"`
			Name string `json:"name"`
		}

		err = db.QueryRow("SELECT id, code, name FROM classrooms WHERE id = ?", classroomID).
			Scan(&classroom.ID, &classroom.Code, &classroom.Name)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Classroom not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve classroom"})
			}
			return
		}

		c.JSON(http.StatusOK, classroom)
	}
}

// ================================== notes download ====================================
func GetNoteFile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract classroom ID and note ID from the URL parameters
		classroomIDStr := c.Param("classroom_Id")
		noteIDStr := c.Param("note_id")

		classroomID, err := strconv.Atoi(classroomIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
			return
		}

		noteID, err := strconv.Atoi(noteIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
			return
		}

		// Query to retrieve the note with the given classroom_id and note_id
		var note struct {
			ID      int    `json:"id"`
			Title   string `json:"title"`
			FileURL string `json:"file_url"`
		}

		err = db.QueryRow(`
			SELECT id, title, file_url
			FROM notes
			WHERE classroom_id = ? AND id = ?`, classroomID, noteID).
			Scan(&note.ID, &note.Title, &note.FileURL)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve note"})
			}
			return
		}

		// Check if file_url exists
		if note.FileURL == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "No file associated with this note"})
			return
		}

		// Serve the file or redirect to it
		// Assuming the file is stored in a directory like /files/
		// Update the file path to your actual file storage path

		filePath := "/files/" + note.FileURL // The full path to the file
		c.File(filePath)
	}
}

// this is the handle for students to see their attendance
func GetAttendanceByStudentID(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentID := c.Param("id")

		// Get classroom_id from query parameter
		classroomID := c.Query("classroom_id")

		fmt.Println("Fetching attendance for Student ID:", studentID)

		var query string
		var rows *sql.Rows
		var err error

		if classroomID != "" {
			// If classroom_id is provided, filter by both student and classroom
			fmt.Println("Filtering by classroom ID:", classroomID)
			query = `
				SELECT a.id, a.date, a.status 
				FROM attendance a
				WHERE a.student_id = ?
				ORDER BY a.date DESC
			`
			rows, err = db.Query(query, studentID)
		} else {
			// If no classroom_id, get all attendance records for the student
			query = `
				SELECT a.id, a.date, a.status 
				FROM attendance a
				WHERE a.student_id = ?
				ORDER BY a.date DESC
			`
			rows, err = db.Query(query, studentID)
		}

		if err != nil {
			fmt.Printf("Database query error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance records"})
			return
		}
		defer rows.Close()

		attendanceRecords := []map[string]interface{}{}

		for rows.Next() {
			var id int
			var dateStr string
			var status string

			if err := rows.Scan(&id, &dateStr, &status); err != nil {
				fmt.Printf("Row scan error: %v\n", err)
				continue
			}

			// Parse the date string
			date, err := time.Parse("2006-01-02", dateStr)
			if err != nil {
				fmt.Printf("Date parsing error: %v for date %s\n", err, dateStr)
				// Use the string as is if parsing fails
				attendanceRecords = append(attendanceRecords, map[string]interface{}{
					"id":     id,
					"date":   dateStr,
					"status": status,
				})
			} else {
				// Use the parsed date
				attendanceRecords = append(attendanceRecords, map[string]interface{}{
					"id":     id,
					"date":   date.Format("2006-01-02"),
					"status": status,
				})
			}
		}

		// Check for errors after iteration
		if err := rows.Err(); err != nil {
			fmt.Printf("Rows iteration error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading attendance data"})
			return
		}

		fmt.Printf("Found %d attendance records for student %s\n", len(attendanceRecords), studentID)

		// Return the records
		c.JSON(http.StatusOK, gin.H{"attendance": attendanceRecords})
	}
}

//===========================================================================================
//===========================================================================================
//============================================================================================

// =============================  STUDENT PERFORMANCE ================================

// Handler for student to get their marks for a specific classroom
func GetStudentMarks(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentIDStr := c.Param("id")
		classroomIDStr := c.Param("classroom_Id")

		studentID, err := strconv.Atoi(studentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
			return
		}

		classroomID, err := strconv.Atoi(classroomIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
			return
		}

		// Query to get all marks for the student in the classroom
		rows, err := db.Query(`
			SELECT id, title, score, max_score, type, date
			FROM marks
			WHERE student_id = ? AND classroom_id = ?
			ORDER BY date DESC`, studentID, classroomID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marks"})
			return
		}
		defer rows.Close()

		var marks []map[string]interface{}
		var totalScore, totalMaxScore float64

		for rows.Next() {
			var mark struct {
				ID       int
				Title    string
				Score    float64
				MaxScore float64
				Type     string
				Date     string
			}

			if err := rows.Scan(&mark.ID, &mark.Title, &mark.Score, &mark.MaxScore, &mark.Type, &mark.Date); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning marks"})
				return
			}

			totalScore += mark.Score
			totalMaxScore += mark.MaxScore

			marks = append(marks, map[string]interface{}{
				"id":         mark.ID,
				"title":      mark.Title,
				"score":      mark.Score,
				"max_score":  mark.MaxScore,
				"type":       mark.Type,
				"date":       mark.Date,
				"percentage": (mark.Score / mark.MaxScore) * 100,
			})
		}

		// Calculate overall performance
		var overallPercentage float64
		if totalMaxScore > 0 {
			overallPercentage = (totalScore / totalMaxScore) * 100
		}

		// Get attendance data for performance summary
		var attendanceRate float64
		err = db.QueryRow(`
			SELECT 
				COALESCE(
					(SELECT COUNT(*) FROM attendance 
					WHERE student_id = ? AND status = 'Present') / 
					CAST(COUNT(*) AS FLOAT) * 100, 
					0
				) 
			FROM attendance 
			WHERE student_id = ?`,
			studentID, studentID).Scan(&attendanceRate)

		if err != nil {
			// If there's an error, just set attendance rate to 0
			attendanceRate = 0
		}

		// Get assignment count
		var totalAssignments, upcomingAssignments int
		err = db.QueryRow(`
			SELECT COUNT(*) 
			FROM assignments 
			WHERE classroom_id = ?`,
			classroomID).Scan(&totalAssignments)

		if err != nil {
			totalAssignments = 0
		}

		// Get upcoming assignments (due in the future)
		err = db.QueryRow(`
			SELECT COUNT(*) 
			FROM assignments 
			WHERE classroom_id = ? AND due_date > CURRENT_TIMESTAMP`,
			classroomID).Scan(&upcomingAssignments)

		if err != nil {
			upcomingAssignments = 0
		}

		// Get total classes count
		var totalClasses int
		err = db.QueryRow(`
			SELECT COUNT(DISTINCT date) 
			FROM attendance 
			WHERE student_id = ?`,
			studentID).Scan(&totalClasses)

		if err != nil {
			totalClasses = 0
		}

		// Return marks and performance summary
		c.JSON(http.StatusOK, gin.H{
			"marks": marks,
			"performance": map[string]interface{}{
				"overall_percentage":   overallPercentage,
				"attendance_rate":      attendanceRate,
				"total_assignments":    totalAssignments,
				"upcoming_assignments": upcomingAssignments,
				"total_classes":        totalClasses,
				"grade":                getGradeFromPercentage(overallPercentage),
			},
		})
	}
}

// Helper function to convert percentage to letter grade
func getGradeFromPercentage(percentage float64) string {
	switch {
	case percentage >= 90:
		return "A+"
	case percentage >= 80:
		return "A"
	case percentage >= 70:
		return "B"
	case percentage >= 60:
		return "C"
	case percentage >= 50:
		return "D"
	default:
		return "F"
	}
}

// Handler to get student's overall performance across all classrooms
func GetStudentOverallPerformance(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentIDStr := c.Param("id")
		studentID, err := strconv.Atoi(studentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
			return
		}

		// Get all classrooms the student is enrolled in
		rows, err := db.Query(`
			SELECT c.id, c.name
			FROM classrooms c
			JOIN classroom_students cs ON c.id = cs.classroom_id
			WHERE cs.student_id = ?`, studentID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classrooms"})
			return
		}
		defer rows.Close()

		var classrooms []map[string]interface{}
		var overallScore, overallMaxScore float64

		for rows.Next() {
			var classroom struct {
				ID   int
				Name string
			}

			if err := rows.Scan(&classroom.ID, &classroom.Name); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning classrooms"})
				return
			}

			// Get marks for this classroom
			marksRows, err := db.Query(`
				SELECT SUM(score), SUM(max_score)
				FROM marks
				WHERE student_id = ? AND classroom_id = ?`, studentID, classroom.ID)

			if err != nil {
				continue
			}

			var classroomScore, classroomMaxScore float64
			if marksRows.Next() {
				marksRows.Scan(&classroomScore, &classroomMaxScore)
			}
			marksRows.Close()

			var classroomPercentage float64
			if classroomMaxScore > 0 {
				classroomPercentage = (classroomScore / classroomMaxScore) * 100
			}

			overallScore += classroomScore
			overallMaxScore += classroomMaxScore

			classrooms = append(classrooms, map[string]interface{}{
				"id":         classroom.ID,
				"name":       classroom.Name,
				"percentage": classroomPercentage,
				"grade":      getGradeFromPercentage(classroomPercentage),
			})
		}

		// Calculate overall GPA
		var gpa float64
		if overallMaxScore > 0 {
			overallPercentage := (overallScore / overallMaxScore) * 100
			// Convert percentage to 4.0 scale GPA
			gpa = convertPercentageToGPA(overallPercentage)
		}

		c.JSON(http.StatusOK, gin.H{
			"classrooms": classrooms,
			"overall_performance": map[string]interface{}{
				"gpa": gpa,
			},
		})
	}
}

// Helper function to convert percentage to 4.0 scale GPA
func convertPercentageToGPA(percentage float64) float64 {
	switch {
	case percentage >= 90:
		return 4.0
	case percentage >= 80:
		return 3.5
	case percentage >= 70:
		return 3.0
	case percentage >= 60:
		return 2.5
	case percentage >= 50:
		return 2.0
	default:
		return 0.0
	}
}
