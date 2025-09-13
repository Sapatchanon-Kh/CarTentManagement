package controllers

import (
	"net/http"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CarController struct {
	DB *gorm.DB
}

func NewCarController(db *gorm.DB) *CarController {
	return &CarController{DB: db}
}

// GET /cars
func (cc *CarController) GetAllCars(c *gin.Context) {
	var cars []entity.Car
	if err := cc.DB.Preload("Detail.Brand").
		Preload("Detail.CarModel").
		Preload("Detail.SubModel").
		Preload("Pictures").
		Preload("Province").
		Preload("Employee").
		Preload("SaleList.Employee").
		Preload("SaleList.Manager").
		Preload("RentList").
		Preload("RentList.RentAbleDates.DateforRent").
		Find(&cars).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resp := make([]entity.CarResponse, 0)
	for _, car := range cars {
		resp = append(resp, mapCarToResponse(car)) // เอา ... ออก
	}

	c.JSON(http.StatusOK, resp)
}

// GET /cars/:id
func (cc *CarController) GetCarByID(c *gin.Context) {
	id := c.Param("id")
	var car entity.Car

	if err := cc.DB.Preload("Detail.Brand").
		Preload("Detail.CarModel").
		Preload("Detail.SubModel").
		Preload("Pictures").
		Preload("Province").
		Preload("Employee").
		Preload("SaleList.Employee").
		Preload("SaleList.Manager").
		Preload("RentList").
		Preload("RentList.RentAbleDates.DateforRent").
		First(&car, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	resp := mapCarToResponse(car)
	c.JSON(http.StatusOK, resp)
}

// helper แปลง Car เป็น CarResponse
func mapCarToResponse(car entity.Car) entity.CarResponse {
	// SaleList
	saleList := make([]entity.SaleEntry, 0)
	for _, s := range car.SaleList {
		employeeName := ""
		employeePhone := ""
		if s.Employee != nil {
			employeeName = s.Employee.FirstName + " " + s.Employee.LastName
			employeePhone = s.Employee.Phone
		}

		saleList = append(saleList, entity.SaleEntry{
			ID:            s.ID,
			Status:        s.Status,
			Description:   s.Description,
			SalePrice:     s.SalePrice,
			EmployeeName:  employeeName,
			EmployeePhone: employeePhone,
		})
	}

	// RentList
	rentList := make([]entity.RentPeriod, 0)
	for _, r := range car.RentList {
		for _, rd := range r.RentAbleDates {
			if rd.DateforRent != nil {
				rentList = append(rentList, entity.RentPeriod{
					ID:            rd.DateforRent.ID,
					RentPrice:     rd.DateforRent.RentPrice,
					RentStartDate: rd.DateforRent.OpenDate.Format("2006-01-02"),
					RentEndDate:   rd.DateforRent.CloseDate.Format("2006-01-02"),
					Status:        rd.DateforRent.Status,
					Description:   rd.DateforRent.Description,
				})
			}
		}
	}

	// Detail
	detail := entity.DetailFilter{
		Brand:    *car.Detail.Brand,
		Model:    *car.Detail.CarModel,
		SubModel: *car.Detail.SubModel,
	}

	// Pictures
	pictures := make([]entity.CarPicture, len(car.Pictures))
	copy(pictures, car.Pictures)

	return entity.CarResponse{
		ID:              car.ID,
		CarName:         car.CarName,
		YearManufacture: car.YearManufacture,
		Color:           car.Color,
		PurchasePrice:   car.PurchasePrice,
		PurchaseDate:    car.PurchaseDate,
		Mileage:         car.Mileage,
		Condition:       car.Condition,
		SaleList:        saleList,
		RentList:        rentList,
		Pictures:        pictures,
		Detail:          detail,
	}
}
