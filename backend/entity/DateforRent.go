package entity

import (
	"time"

	"gorm.io/gorm"
)

type DateforRent struct {
	gorm.Model
	OpenDate      time.Time       `json:"open_date"`
	CloseDate     time.Time       `json:"close_date"`
	RentAbleDates []*RentAbleDate `gorm:"foreignKey:DateforRentID" json:"rent_able_dates"` // ✅ pointer slice
	RentPrice     float64         `json:"rent_price"`
	Status        string          `gorm:"default:'available'" json:"period_status"`
	BookedBy      uint            `json:"booked_by"`
	Description   string          `json: "description"`
}
