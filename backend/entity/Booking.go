package entity

import "gorm.io/gorm"

type Booking struct {
	gorm.Model

	CustomerID uint      
	Customer   *Customer `gorm:"foreignKey:CustomerID"`

	SaleListID uint
	SaleList   *SaleList `gorm:"foreignKey:SaleListID"`
}
