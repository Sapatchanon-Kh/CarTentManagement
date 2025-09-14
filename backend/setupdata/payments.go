package setupdata

import (
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

func CreatePayments(db *gorm.DB) {
	// ตัวช่วยสร้าง pointer
	uintPtr := func(i uint) *uint { return &i }

	payments := []entity.Payment{
		{
			Amount:         "150000.00",
			PaymentDate:    time.Now().AddDate(0, 0, -2),
			Status:         "ชำระแล้ว",
			CustomerID:     1,
			EmployeeID:     1,
			SalesContractID: uintPtr(1),
			PaymentMethodID: 1, // โอนผ่านธนาคาร
		},
		{
			Amount:         "250000.00",
			PaymentDate:    time.Now().AddDate(0, 0, -1),
			Status:         "รอดำเนินการ",
			CustomerID:     1,
			EmployeeID:     2,
			SalesContractID: uintPtr(2),
			PaymentMethodID: 2, // พร้อมเพย์
		},
		{
			Amount:         "5000.00",
			PaymentDate:    time.Now(),
			Status:         "ถูกปฏิเสธ",
			CustomerID:     1,
			EmployeeID:     1,
			RentContractID: uintPtr(3),
			PaymentMethodID: 1, // โอนผ่านธนาคาร
		},
		{
			Amount:         "10000.00",
			PaymentDate:    time.Now().AddDate(0, 0, -3),
			Status:         "ถูกปฏิเสธ",
			CustomerID:     2,
			EmployeeID:     2,
			RentContractID: uintPtr(1),
			PaymentMethodID: 2, // พร้อมเพย์
		},
	}

	for _, p := range payments {
		db.Create(&p)
	}
}
