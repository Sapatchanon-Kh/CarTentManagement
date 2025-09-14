package entity

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model

	Amount      string    `json:"amount"`
	PaymentDate time.Time `json:"payment_date"`
	Status      string    `json:"status"`

	// หลักฐานการชำระ (ลูกค้าอัปโหลด)
	ProofURL    string `json:"proof_url"`
	ProofMethod string `json:"proof_method"` // "ธนาคาร" | "พร้อมเพย์"

	CustomerID uint      `json:"customer_id"`
	Customer   *Customer `gorm:"foreignKey:CustomerID"`

	EmployeeID uint      `json:"employee_id"`
	Employee   *Employee `gorm:"foreignKey:EmployeeID"`

	SalesContractID *uint          `json:"sales_contract_id"`
	SalesContract   *SalesContract `gorm:"foreignKey:SalesContractID"`

	RentContractID *uint        `json:"rent_contract_id"`
	RentContract   *RentContract `gorm:"foreignKey:RentContractID"`

	PaymentMethodID uint           `json:"payment_method_id"`
	PaymentMethod   *PaymentMethod `gorm:"foreignKey:PaymentMethodID"`

	Receipt Receipt `gorm:"foreignKey:PaymentID"`
}
