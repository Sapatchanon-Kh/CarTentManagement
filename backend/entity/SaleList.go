package entity

import (
	"gorm.io/gorm"
)

type SaleList struct {
	gorm.Model
	SalePrice   float64 `json:"sale_price"`
	Description string  `json:"description"` // เพิ่ม field description

	CarID  uint   `json:"carID"`
	Car    *Car   `gorm:"foreignKey:CarID" json:"car"`
	Status string `json:"status"`

	ManagerID uint     `json:"managerID"`
	Manager   *Manager `gorm:"foreignKey:ManagerID" json:"manager"`

	EmployeeID uint      `json:"employeeID"`
	Employee   *Employee `gorm:"foreignKey:EmployeeID" json:"employee"`

	SalesContract []SalesContract `gorm: "foreignKey:SaleListID" json:"sales_contract"`
}
