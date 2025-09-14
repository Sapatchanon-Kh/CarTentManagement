package entity

import (
)

type Employee struct {
	EmployeeID   uint      `json:"employeeID" gorm:"primaryKey;autoIncrement"`
	ProfileImage string    `json:"profileImage"`
	FirstName    string    `json:"firstName"`
	LastName     string    `json:"lastName"`
	Password     string    `json:"-"`
	Email        string    `json:"email" gorm:"uniqueIndex"`
	Phone        string    `json:"phone"`
	Address      string    `json:"address"`
	Birthday     string    `json:"birthday"` // ✅ เก็บเป็น string (YYYY-MM-DD)
	Sex          string    `json:"sex"`
	Position     string    `json:"position"`
	JobType      string    `json:"jobType"`
	TotalSales   string    `json:"totalSales"`

	LeaveRequests  []LeaveRequest   `json:"leaves" gorm:"-"`
	PickupDelivery []PickupDelivery `gorm:"foreignKey:EmployeeID"`
	
	SaleList       []SaleList       `gorm:"foreignKey:EmployeeID"`
	SalesContract  []SalesContract  `gorm:"foreignKey:EmployeeID"`
	Payment 	 []Payment       `gorm:"foreignKey:EmployeeID"`
}
