package setupdata

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

func InsertCarsFromCSV(db *gorm.DB, filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		log.Fatal("cannot open CSV file:", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}

	for i, row := range rows {
		if i == 0 {
			continue
		}

		brandName := row[0]
		modelName := row[1]
		subModelName := row[2]

		var brand entity.Brand
		db.Where("brand_name = ?", brandName).FirstOrCreate(&brand, entity.Brand{BrandName: brandName})

		var carModel entity.CarModel
		db.Where("model_name = ? AND brand_id = ?", modelName, brand.ID).
			FirstOrCreate(&carModel, entity.CarModel{ModelName: modelName, BrandID: brand.ID})

		var subModel entity.SubModel
		db.Where("sub_model_name = ? AND car_model_id = ?", subModelName, carModel.ID).
			FirstOrCreate(&subModel, entity.SubModel{SubModelName: subModelName, CarModelID: carModel.ID})

		var detail entity.Detail
		db.Where("brand_id = ? AND car_model_id = ? AND sub_model_id = ?", brand.ID, carModel.ID, subModel.ID).
			FirstOrCreate(&detail, entity.Detail{
				BrandID:    brand.ID,
				CarModelID: carModel.ID,
				SubModelID: subModel.ID,
			})

		yearManufacture := 0
		fmt.Sscanf(row[4], "%d", &yearManufacture)

		purchasePrice := 0.0
		fmt.Sscanf(row[5], "%f", &purchasePrice)

		purchaseDate, _ := time.Parse("2006-01-02", row[6])

		provinceID := 0
		fmt.Sscanf(row[8], "%d", &provinceID)

		managerID := 0
		fmt.Sscanf(row[9], "%d", &managerID)

		mileage := 0
		fmt.Sscanf(row[10], "%d", &mileage)

		condition := row[11]

		car := entity.Car{
			CarName:         row[3],
			YearManufacture: yearManufacture,
			PurchasePrice:   purchasePrice,
			PurchaseDate:    purchaseDate,
			Color:           row[7],
			ProvinceID:      uint(provinceID),
			DetailID:        detail.ID,
			ManagerID:       uint(managerID),
			Mileage:         mileage,
			Condition:       condition,
		}

		db.Create(&car)

		// สร้างรูปภาพ 3 มุมจาก CSV
		pictures := []entity.CarPicture{
			{Title: "Front view", Path: row[12], CarID: car.ID},
			{Title: "Side view", Path: row[13], CarID: car.ID},
			{Title: "Interior", Path: row[14], CarID: car.ID},
			{Title: "Main", Path: row[15], CarID: car.ID},
			{Title: "Bottom", Path: row[16], CarID: car.ID},
		}

		for _, pic := range pictures {
			db.Create(&pic)
		}
	}

	fmt.Println("Inserted CSV Car data successfully with Mileage, Condition, and Pictures!")
}
