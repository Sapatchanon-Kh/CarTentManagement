package setupdata

import (
	"log"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

// InsertTypeInformations เพิ่มข้อมูลประเภทการรับ-ส่งรถ
func InsertTypeInformations(db *gorm.DB) {
	types := []entity.TypeInformation{
		// VVVV --- แก้ไขชื่อฟิลด์เป็น Type --- VVVV
		{Type: "รับที่เต็นท์"},
		{Type: "ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)"},
	}

	for _, t := range types {
		// VVVV --- และแก้ไขชื่อฟิลด์ตรงนี้ด้วย --- VVVV
		db.Where(entity.TypeInformation{Type: t.Type}).FirstOrCreate(&t)
	}
	log.Println("TypeInformation data inserted successfully.")
}

