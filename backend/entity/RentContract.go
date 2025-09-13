package entity

import (
	"gorm.io/gorm"

	"time"
)

type RentContract struct {
	gorm.Model

	// PriceAgree float64   `json:"price_agree"`
	DateStart time.Time `json:date_start`
	DateEnd   time.Time `json:date_end`

	RentListID uint      `json:"rent_list_id"`
	RentList   *RentList `gorm:"foreignKey:RentListID" json:"rent_list"`

	
	CustomerID uint      `json:"customer_id"`
	Customer   *Customer `gorm:"foreignKey:CustomerID" json:"customer"`

	Payment []*Payment `gorm:"foreignKey:RentContractID" json:"payments"` // plural
}
