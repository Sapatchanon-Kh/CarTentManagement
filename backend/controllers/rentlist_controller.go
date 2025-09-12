package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RentListController struct {
	DB *gorm.DB
}

func NewRentListController(db *gorm.DB) *RentListController {
	return &RentListController{DB: db}
}

// GET /rentlists/:carId
func (rc *RentListController) GetRentListsByCar(c *gin.Context) {
	carId := c.Param("carId")

	var car entity.Car
	if err := rc.DB.Preload("Pictures").
		First(&car, carId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	var rentList entity.RentList
	err := rc.DB.Preload("RentAbleDates.DateforRent").
		Where("car_id = ?", carId).
		First(&rentList).Error

	rentPeriods := []entity.RentPeriod{}
	if err == nil {
		for _, rad := range rentList.RentAbleDates {
			date := rad.DateforRent
			rentPeriods = append(rentPeriods, entity.RentPeriod{
				ID:            date.ID,
				RentPrice:     date.RentPrice,
				RentStartDate: date.OpenDate.Format("2006-01-02"),
				RentEndDate:   date.CloseDate.Format("2006-01-02"),
				Status:        date.Status, // เพิ่ม status
			})
		}
	}

	response := entity.CarResponse{
		ID:              car.ID,
		CarName:         car.CarName,
		YearManufacture: car.YearManufacture,
		Color:           car.Color,
		Mileage:         car.Mileage,
		Condition:       car.Condition,
		SaleList:        nil,
		RentList:        rentPeriods,
		Pictures:        car.Pictures,
		Status:          rentList.Status,
	}

	c.JSON(http.StatusOK, response)
}

// POST /rentlists
// CreateOrUpdateRentList
func (rc *RentListController) CreateOrUpdateRentList(c *gin.Context) {
	type DateInput struct {
		ID        uint    `json:"id"`
		OpenDate  string  `json:"open_date"`
		CloseDate string  `json:"close_date"`
		RentPrice float64 `json:"rent_price"`
	}

	type Input struct {
		CarID     uint        `json:"car_id"`
		ManagerID uint        `json:"manager_id"`
		Dates     []DateInput `json:"dates"`
	}

	var input Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// หา RentList หรือสร้างใหม่
	var rentList entity.RentList
	err := rc.DB.Where("car_id = ?", input.CarID).First(&rentList).Error
	if err == gorm.ErrRecordNotFound {
		rentList = entity.RentList{
			CarID:     input.CarID,
			ManagerID: input.ManagerID,
			Status:    "forRent", // สร้างใหม่ → forRent
		}
		rc.DB.Create(&rentList)
	} else {
		// ถ้ามีช่วงเช่าใหม่ → status = forRent
		if len(input.Dates) > 0 {
			rentList.Status = "forRent"
			rc.DB.Save(&rentList)
		}
	}

	// จัดการแต่ละช่วงเช่า
	for _, d := range input.Dates {
		open, _ := time.Parse("2006-01-02", d.OpenDate)
		close, _ := time.Parse("2006-01-02", d.CloseDate)

		if d.ID != 0 {
			// Update
			var existing entity.DateforRent
			if err := rc.DB.First(&existing, d.ID).Error; err == nil {
				existing.OpenDate = open
				existing.CloseDate = close
				existing.RentPrice = d.RentPrice
				existing.Status = "available" // ตั้ง status อัตโนมัติ
				rc.DB.Save(&existing)
			}
		} else {
			// Create
			date := entity.DateforRent{
				OpenDate:  open,
				CloseDate: close,
				RentPrice: d.RentPrice,
				Status:    "available", // สร้างใหม่ → available
			}
			rc.DB.Create(&date)

			rc.DB.Create(&entity.RentAbleDate{
				RentListID:    rentList.ID,
				DateforRentID: date.ID,
			})
		}
	}

	// Preload คืนค่า
	rc.DB.Preload("RentAbleDates.DateforRent").First(&rentList, rentList.ID)
	c.JSON(http.StatusOK, rentList)
}

// DELETE /rentlists/date/:dateId
func (rc *RentListController) DeleteRentDate(c *gin.Context) {
	dateId := c.Param("dateId")
	var id uint
	fmt.Sscanf(dateId, "%d", &id)

	if err := rc.DB.Delete(&entity.RentAbleDate{}, "datefor_rent_id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := rc.DB.Delete(&entity.DateforRent{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Date deleted"})
}

func (rc *RentListController) BookCar(c *gin.Context) {
	_ = c.Param("carId")

	type Input struct {
		DateIDs []uint `json:"date_ids"`
		UserID  uint   `json:"user_id"`
	}

	var input Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var bookedDates []entity.DateforRent
	tx := rc.DB.Begin() // ใช้ transaction ป้องกัน race condition

	for _, dateID := range input.DateIDs {
		var date entity.DateforRent
		if err := tx.First(&date, dateID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("date %d not found", dateID)})
			return
		}

		if date.Status != "available" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("date %d is not available", dateID)})
			return
		}

		// จองสำเร็จ
		date.Status = "booked"
		date.BookedBy = input.UserID
		if err := tx.Save(&date).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		bookedDates = append(bookedDates, date)
	}

	tx.Commit()
	c.JSON(http.StatusOK, bookedDates)
}
