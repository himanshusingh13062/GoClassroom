package main

import (
	"crypto/sha256"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password,omitempty"`
	UserType string `json:"user_type"`
}

func hashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return fmt.Sprintf("%x", hash)
}

func signup(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hashedPassword := hashPassword(user.Password)

	result, err := db.Exec(`INSERT INTO users (username, password_hash, user_type) VALUES (?, ?, ?)`,
		user.Username, hashedPassword, user.UserType)

	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists. Please use a different email."})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		}
		return
	}

	userID, _ := result.LastInsertId()
	c.JSON(http.StatusOK, gin.H{
		"message": "User registered successfully",
		"user_id": userID,
	})
}

func login(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var dbUser User
	err := db.QueryRow(`SELECT user_id, username, password_hash, user_type FROM users WHERE username = ?`, user.Username).
		Scan(&dbUser.ID, &dbUser.Username, &dbUser.Password, &dbUser.UserType)

	if err == sql.ErrNoRows || dbUser.Password != hashPassword(user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	token, err := GenerateJWT(dbUser.Username, dbUser.UserType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":     token,
		"user_id":   dbUser.ID,
		"username":  dbUser.Username,
		"user_type": dbUser.UserType,
	})
}
