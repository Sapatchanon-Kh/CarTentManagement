package entity

import (
	"gorm.io/gorm"
)

type Customer struct {
	gorm.Model
	Password  string `json:"password"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Birthday  string `json:"birthday"`

	PickupDelivery         []PickupDelivery        `gorm:"foreignKey:CustomerID" json:"pickup_deliveries"`
	InspectionAppointments []InspectionAppointment `gorm:"foreignKey:CustomerID" json:"inspection_appointments"`
	SalesContract          []SalesContract         `gorm:"foreignKey:CustomerID" json:"sales_contracts"`

	Payment []Payment `gorm:"foreignKey:CustomerID" json:"payments"`
	Booking                []Booking               `gorm:"foreignKey:CustomerID" json:"booking"`
}
