package entity

import (
	"time"

	"gorm.io/gorm"
)

// delete
type Manager struct {
	gorm.Model

	Username  string 
	Password  string
	FirstName string
	LastName  string
	Birthday  time.Time
	Email  string

	Car      []Car      `gorm:"foreignKey:ManagerID"`
	SaleList []SaleList `gorm:"foreignKey:ManagerID"`
}
