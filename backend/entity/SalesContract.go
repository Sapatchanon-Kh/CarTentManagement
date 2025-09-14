package entity

import (
	"gorm.io/gorm"
)

type SalesContract struct {
	gorm.Model

	SaleListID uint
	SaleList   *SaleList `gorm:"foreignKey:SaleListID"`

	EmployeeID uint		// `json:"employee_id"`
	Employee   *Employee `gorm:"foreignKey:EmployeeID"`

	CustomerID uint
	Customer   *Customer `gorm:"foreignKey:CustomerID"`

	// เปลี่ยนเป็น pointer slice และระบุ foreignKey
	InspectionAppointments []*InspectionAppointment `gorm:"foreignKey:SalesContractID"`

	Payment []*Payment `gorm:"foreignKey:SalesContractID"`
}
