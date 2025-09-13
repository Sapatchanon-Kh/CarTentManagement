package controllers

import (
	"net/http"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Controller struct
type CustomerByCarController struct {
	DB *gorm.DB
}

// Constructor
func NewCustomerByCarController(db *gorm.DB) *CustomerByCarController {
	return &CustomerByCarController{DB: db}
}

// Struct สำหรับ JSON response ของลูกค้า
type CustomerInfo struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

// Struct สำหรับ JSON response ของรถพร้อมลูกค้า
type CustomerByCarResponse struct {
	ID        uint              `json:"id"`
	CarName   string            `json:"car_name"`
	Year      int               `json:"year_manufacture"`
	Color     string            `json:"color"`
	Mileage   int               `json:"mileage"`
	Condition string            `json:"condition"`
	SaleList  []entity.SaleList `json:"sale_list"`
	RentList  []entity.RentList `json:"rent_list"`
	Manager   *entity.Manager   `json:"manager"`
	Customers []CustomerInfo    `json:"customers"`
}

// GET /customer-bycar/:id
func (ctrl *CustomerByCarController) GetCustomerByCar(c *gin.Context) {
	carID := c.Param("id")

	var car entity.Car
	if err := ctrl.DB.Preload("SaleList.SalesContract.Customer").
		Preload("RentList.RentContract.Customer").
		Preload("Manager").
		First(&car, carID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	// Map customers ไม่ให้ซ้ำ
	customersMap := map[uint]CustomerInfo{}
	for _, sale := range car.SaleList {
		for _, sc := range sale.SalesContract {
			if sc.Customer.ID != 0 {
				customersMap[sc.Customer.ID] = CustomerInfo{
					ID:    sc.Customer.ID,
					Name:  sc.Customer.FirstName,
					Phone: sc.Customer.Phone,
				}
			}
		}
	}
	for _, rent := range car.RentList {
		for _, rc := range rent.RentContract {
			if rc.Customer.ID != 0 {
				customersMap[rc.Customer.ID] = CustomerInfo{
					ID:    rc.Customer.ID,
					Name:  rc.Customer.FirstName,
					Phone: rc.Customer.Phone,
				}
			}
		}
	}

	customers := []CustomerInfo{}
	for _, cInfo := range customersMap {
		customers = append(customers, cInfo)
	}

	response := CustomerByCarResponse{
		ID:        car.ID,
		CarName:   car.CarName,
		Year:      car.YearManufacture,
		Color:     car.Color,
		Mileage:   car.Mileage,
		Condition: car.Condition,
		SaleList:  car.SaleList,
		RentList:  car.RentList,
		Manager:   car.Manager,
		Customers: customers,
	}

	c.JSON(http.StatusOK, response)
}
