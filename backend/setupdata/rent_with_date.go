package setupdata

import (
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

func InsertMockRentListWithDates(db *gorm.DB) {
	var cars []entity.Car
	db.Find(&cars)
	var managers []entity.Manager
	db.Find(&managers)

	// ใช้ 5 คันแรกตรงๆ
	for _, car := range cars[:5] {
		// กำหนดผู้จัดการแบบไม่สุ่ม (ใช้คนแรก)
		manager := managers[0]
		status := "Available"

		// สร้าง RentList
		rentList := entity.RentList{
			CarID:     car.ID,
			Status:    status,
			ManagerID: manager.ID,
		}
		db.Create(&rentList)

		// สร้าง DateforRent + RentAbleDate 2 วันเช่า
		for i := 0; i < 2; i++ {
			open := time.Now().AddDate(0, 0, i*3) // วันที่เปิด เพิ่มทีละ 3 วัน
			close := open.AddDate(0, 0, 2)        // ปิดหลัง 2 วัน
			price := car.PurchasePrice * 0.05     // ราคาเช่า 5% ของราคา

			date := entity.DateforRent{
				OpenDate:    open,
				CloseDate:   close,
				RentPrice:   price,
				Status:      "available",
				Description: "Mock rent date",
			}
			db.Create(&date)

			rentAble := entity.RentAbleDate{
				RentListID:    rentList.ID,
				DateforRentID: date.ID,
			}
			db.Create(&rentAble)
		}
	}
}
