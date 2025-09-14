package setupdata

import (
	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

func CreatePaymentMethods(db *gorm.DB) {
	methods := []entity.PaymentMethod{
		{MethodName: "โอนผ่านธนาคาร", Description: "โอนเข้าบัญชีบริษัท"},
		{MethodName: "พร้อมเพย์", Description: "พร้อมเพย์บริษัท"},
	}

	for _, m := range methods {
		db.FirstOrCreate(&m, entity.PaymentMethod{MethodName: m.MethodName})
	}
}
