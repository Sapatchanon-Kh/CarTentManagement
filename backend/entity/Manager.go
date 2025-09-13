package entity

import (
	"time"

	"gorm.io/gorm"
)

// delete
type Manager struct {
	gorm.Model

	Username  string
	Email     string
	Password  string
	FirstName string
	LastName  string
	Birthday  time.Time

	Car      []Car      `gorm:"foreignKey:ManagerID"`
	SaleList []SaleList `gorm:"foreignKey:ManagerID"`
}
