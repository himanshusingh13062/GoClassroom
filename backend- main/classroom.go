package main

import (
	"database/sql"
	"math/rand"
	"net/http"
	"time"
	"path/filepath"
	"net/url"
	"strconv"
	"fmt"

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

type JoinClassroomRequest struct {
	StudentID uint   `json:"student_id" binding:"required"`
	Code      string `json:"code" binding:"required"`
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
			return
		}

		classroomID, _ := result.LastInsertId()

		c.JSON(http.StatusOK, gin.H{
			"message": "Classroom created successfully",
			"classroom": map[string]interface{}{
				"id": classroomID,
				"teacher_id": req.TeacherID,
				"name": req.Name,
				"code": code,
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

		// Iterate through rows and populate classrooms slice
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
		classroomID := c.Param("classroom_id")

		// Query the database for the classroom
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

		// Parse the `created_at` string into time.Time
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

func JoinClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req JoinClassroomRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		var classroomID uint
		err := db.QueryRow(`SELECT id FROM classrooms WHERE code = ?`, req.Code).Scan(&classroomID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invalid classroom code"})
			return
		}

		_, err = db.Exec(`
			INSERT INTO subscriptions (student_id, classroom_id)
			VALUES (?, ?)`, req.StudentID, classroomID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join classroom"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Successfully joined the classroom"})
	}
}


// ======================================================

func CreateNoteForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ClassroomID uint   `json:"classroom_id" binding:"required"`
			Title       string `json:"title" binding:"required"`
			Content     string `json:"content" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		_, err := db.Exec(`
			INSERT INTO notes (classroom_id, title, content)
			VALUES (?, ?, ?)`, req.ClassroomID, req.Title, req.Content)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create note"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Note created successfully"})
	}
}

func GetNotesForClassroom(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get classroom_id from URL and convert to integer
        classroomIDStr := c.Param("classroom_id")
        classroomID, err := strconv.Atoi(classroomIDStr)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid classroom ID"})
            return
        }

        // Query the database for notes of the specific classroom
        rows, err := db.Query(`
            SELECT id, title, content, created_at, file_url
            FROM notes WHERE classroom_id = ?`, classroomID)

        if err != nil {
            fmt.Println("Error executing query:", err) // Log the actual error to see why it's failing
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notes"})
            return
        }
        defer rows.Close()

        var notes []map[string]interface{}
        for rows.Next() {
            var note struct {
                NoteID   uint      `json:"note_id"`
                Title    string    `json:"title"`
                Content  string    `json:"content"`
                CreatedAt time.Time `json:"created_at"`
                FileURL  string    `json:"file_url"`
            }
            if err := rows.Scan(&note.NoteID, &note.Title, &note.Content, &note.CreatedAt, &note.FileURL); err != nil {
                fmt.Println("Error scanning row:", err) // Log the scanning error
                continue
            }

            notes = append(notes, map[string]interface{}{
                "note_id":   note.NoteID,
                "title":     note.Title,
                "content":   note.Content,
                "created_at": note.CreatedAt,
                "file_url":  note.FileURL,
            })
        }

        if len(notes) == 0 {
            c.JSON(http.StatusOK, gin.H{"notes": []interface{}{}})
            return
        }

        c.JSON(http.StatusOK, gin.H{"notes": notes})
    }
}


// Similarly add for assignments

func CreateAssignmentForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ClassroomID uint   `json:"classroom_id" binding:"required"`
			Title       string `json:"title" binding:"required"`
			Description string `json:"description" binding:"required"`
			DueDate     string `json:"due_date" binding:"required"`
			FileURL     string `json:"file_url"` // This will hold the file URL provided by the user
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// If FileURL is provided, ensure it's a valid URL (Optional Validation)
		if req.FileURL != "" {
			_, err := url.ParseRequestURI(req.FileURL)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file URL"})
				return
			}
		}

		_, err := db.Exec(`
			INSERT INTO assignments (classroom_id, title, description, due_date, file_url)
			VALUES (?, ?, ?, ?, ?)`, req.ClassroomID, req.Title, req.Description, req.DueDate, req.FileURL)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Assignment created successfully"})
	}
}


func GetAssignmentsForClassroom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		classroomID := c.Param("classroom_id")
		rows, err := db.Query(`
			SELECT assignment_id, title, description, due_date, created_at
			FROM assignments WHERE classroom_id = ?`, classroomID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
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
			}
			if err := rows.Scan(&assignment.AssignmentID, &assignment.Title, &assignment.Description, &assignment.DueDate, &assignment.CreatedAt); err != nil {
				continue
			}
			assignments = append(assignments, map[string]interface{}{
				"assignment_id": assignment.AssignmentID,
				"title":         assignment.Title,
				"description":   assignment.Description,
				"due_date":      assignment.DueDate,
				"created_at":    assignment.CreatedAt,
			})
		}
		c.JSON(http.StatusOK, gin.H{"assignments": assignments})
	}
}


// notes url handler 
func UploadNoteFile(c *gin.Context) {
    classroomID := c.PostForm("classroom_id")
    title := c.PostForm("title")
    content := c.PostForm("content") // optional if uploading only file

    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No file received"})
        return
    }

    // Save the file
    extension := filepath.Ext(file.Filename)
    filename := "uploads/notes/" + time.Now().Format("20060102150405") + extension

    if err := c.SaveUploadedFile(file, filename); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    // Save the note in the database with file URL
    query := "INSERT INTO notes (classroom_id, title, content, file_url) VALUES (?, ?, ?, ?)"
    _, err = db.Exec(query, classroomID, title, content, filename)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save note to database"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Note uploaded successfully", "file_url": filename})
}

// ================================================= assignemnht file upload

// Assignment file upload handler
func UploadAssignmentFile(c *gin.Context) {
    classroomID := c.PostForm("classroom_id")
    title := c.PostForm("title")
    description := c.PostForm("description") // optional if uploading only file
    dueDate := c.PostForm("due_date")

    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No file received"})
        return
    }

    extension := filepath.Ext(file.Filename)
    filename := "uploads/assignments/" + time.Now().Format("20060102150405") + extension

    if err := c.SaveUploadedFile(file, filename); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    query := "INSERT INTO assignments (classroom_id, title, description, due_date, file_url) VALUES (?, ?, ?, ?, ?)"
    _, err = db.Exec(query, classroomID, title, description, dueDate, filename)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save assignment to database"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Assignment uploaded successfully", "file_url": filename})
}
