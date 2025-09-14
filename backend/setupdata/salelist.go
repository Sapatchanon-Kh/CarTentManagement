package setupdata

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

// InsertMockSaleList สร้าง SaleList mock ให้รถแต่ละคัน 1 รายการ
func InsertMockSaleList(db *gorm.DB) {
	// ดึงรถทั้งหมด
	var cars []entity.Car
	if err := db.Find(&cars).Error; err != nil {
		fmt.Println("ไม่สามารถดึงข้อมูลรถ:", err)
		return
	}
	if len(cars) == 0 {
		fmt.Println("ไม่พบรถในระบบ -> ยัง insert SaleList ไม่ได้")
		return
	}

	// ดึงพนักงานทั้งหมด
	var employees []entity.Employee
	if err := db.Find(&employees).Error; err != nil || len(employees) == 0 {
		fmt.Println("ไม่พบพนักงาน -> ยัง insert SaleList ไม่ได้")
		return
	}

	// ดึง Manager ทั้งหมด
	var managers []entity.Manager
	if err := db.Find(&managers).Error; err != nil || len(managers) == 0 {
		fmt.Println("ไม่พบ Manager -> ยัง insert SaleList ไม่ได้")
		return
	}

	rand.Seed(time.Now().UnixNano())

	// จำกัดสูงสุด 20 คัน
	limit := 15
	if len(cars) < limit {
		limit = len(cars)
	}

	for i := 10; i < limit; i++ {
		car := cars[i]

		// สุ่มราคาขายจากต้นทุน
		salePrice := car.PurchasePrice + float64(rand.Intn(200000)) // +0 ถึง +200k

		// สุ่มสถานะ
		status := "Available"

		// สุ่ม Manager และ Employee
		manager := managers[rand.Intn(len(managers))]
		emp := employees[rand.Intn(len(employees))]

		sale := entity.SaleList{
			SalePrice:   salePrice,
			CarID:       car.ID,
			Status:      status,
			ManagerID:   &manager.ID,     // pointer
			EmployeeID:  &emp.EmployeeID, // pointer
			Description: "รถคันนี้ เร็ว แรง ทะลุ นรก",
		}

		if err := db.Create(&sale).Error; err != nil {
			fmt.Println("Insert SaleList ล้มเหลว:", err)
		}
	}

	fmt.Printf("Inserted mock SaleList successfully! (%d records)\n", limit)
}
