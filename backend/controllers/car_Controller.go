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

// Constructor
func NewCarController(db *gorm.DB) *CarController {
	return &CarController{DB: db}
}

// Response struct สำหรับทั้ง GetAllCars และ GetCarByID
type RentPeriod struct {
	RentPrice     float64 `json:"rent_price"`
	RentStartDate string  `json:"rent_start_date"`
	RentEndDate   string  `json:"rent_end_date"`
}

type CarResponse struct {
	entity.Car
	SaleList []struct {
		SalePrice float64 `json:"sale_price"`
	} `json:"sale_list,omitempty"`
	RentList []RentPeriod `json:"rent_list,omitempty"`
}

// GET /cars
func (cc *CarController) GetAllCars(c *gin.Context) {
	var cars []entity.Car
	if err := cc.DB.Preload("Detail.Brand").
		Preload("Detail.CarModel").
		Preload("Detail.SubModel").
		Preload("Pictures").
		Preload("Province").
		Preload("Manager").
		Preload("SaleList").
		Preload("RentList.RentAbleDates.DateforRent").
		Find(&cars).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var resp []CarResponse
	for _, car := range cars {
		cr := CarResponse{Car: car}

		// SaleList
		for _, s := range car.SaleList {
			cr.SaleList = append(cr.SaleList, struct {
				SalePrice float64 `json:"sale_price"`
			}{SalePrice: s.SalePrice})
		}

		// RentList (หลายช่วง)
		for _, r := range car.RentList {
			for _, rd := range r.RentAbleDates {
				if rd.DateforRent != nil {
					cr.RentList = append(cr.RentList, RentPeriod{
						RentPrice:     rd.DateforRent.RentPrice,
						RentStartDate: rd.DateforRent.OpenDate.Format("2006-01-02"),
						RentEndDate:   rd.DateforRent.CloseDate.Format("2006-01-02"),
					})
				}
			}
		}

		resp = append(resp, cr)
	}

	c.JSON(http.StatusOK, resp)
}

func (cc *CarController) GetCarByID(c *gin.Context) {
	id := c.Param("id")
	var car entity.Car

	if err := cc.DB.Preload("Detail.Brand").
		Preload("Detail.CarModel").
		Preload("Detail.SubModel").
		Preload("Pictures").
		Preload("Province").
		Preload("Manager").
		Preload("SaleList").
		Preload("RentList.RentAbleDates.DateforRent").
		First(&car, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	cr := CarResponse{Car: car}

	// SaleList
	for _, s := range car.SaleList {
		cr.SaleList = append(cr.SaleList, struct {
			SalePrice float64 `json:"sale_price"`
		}{SalePrice: s.SalePrice})
	}

	// RentList
	for _, r := range car.RentList {
		for _, rd := range r.RentAbleDates {
			if rd.DateforRent != nil {
				cr.RentList = append(cr.RentList, RentPeriod{
					RentPrice:     rd.DateforRent.RentPrice,
					RentStartDate: rd.DateforRent.OpenDate.Format("2006-01-02"),
					RentEndDate:   rd.DateforRent.CloseDate.Format("2006-01-02"),
				})
			}
		}
	}

	c.JSON(http.StatusOK, cr)
}
