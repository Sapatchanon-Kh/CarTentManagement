package controllers

import (
	"net/http"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SaleController struct {
	DB *gorm.DB
}

func NewSaleController(db *gorm.DB) *SaleController {
	return &SaleController{DB: db}
}

// GET /sale/cars
// ดึงรถทั้งหมดพร้อม SaleList
func (sc *SaleController) GetCarsWithSale(c *gin.Context) {
	var cars []entity.Car

	if err := sc.DB.Preload("Pictures").
		Preload("Province").
		Preload("Detail.Brand").
		Preload("Detail.CarModel").
		Preload("Detail.SubModel").
		Preload("SaleList.Employee").
		Preload("SaleList.Manager").
		Find(&cars).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cars)
}

// GET /sale/:id
// ดึง SaleList ตาม ID พร้อมข้อมูล Car, Employee, Manager
func (sc *SaleController) GetSaleByID(c *gin.Context) {
	id := c.Param("id")
	var sale entity.SaleList

	if err := sc.DB.Preload("Car").
		Preload("Employee").
		Preload("Manager").
		First(&sale, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}

	c.JSON(http.StatusOK, sale)
}

// POST /sale
// สร้างรายการขายใหม่
// POST /sale
func (sc *SaleController) CreateSale(c *gin.Context) {
	var input struct {
		CarID       uint    `json:"car_id" binding:"required"`
		SalePrice   float64 `json:"sale_price" binding:"required"`
		ManagerID   uint    `json:"manager_id" binding:"required"`
		EmployeeID  uint    `json:"employee_id" binding:"required"`
		Description string  `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sale := entity.SaleList{
		CarID:       input.CarID,
		SalePrice:   input.SalePrice,
		Status:      "Available",
		ManagerID:   &input.ManagerID,
		EmployeeID:  &input.EmployeeID,
		Description: input.Description,
	}

	if err := sc.DB.Create(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	sc.DB.Preload("Car").Preload("Employee").Preload("Manager").First(&sale, sale.ID)

	c.JSON(http.StatusOK, sale)
}
// GET /sale/car/:car_id/price/:price
// ดึง SaleList จาก CarID และ SalePrice
func (sc *SaleController) GetSaleListByCarAndPrice(c *gin.Context) {
	carID := c.Param("car_id")
	price := c.Param("price")

	var saleList entity.SaleList

	// ค้นหา SaleList ที่มี CarID และ SalePrice ตรงกับที่รับมา
	if err := sc.DB.Where("car_id = ? AND sale_price = ?", carID, price).First(&saleList).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "SaleList not found for the given car and price"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, saleList)
}
// PUT /sale/:id
func (sc *SaleController) UpdateSale(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		SalePrice   float64 `json:"sale_price" binding:"required"`
		ManagerID   uint    `json:"manager_id" binding:"required"`
		EmployeeID  uint    `json:"employee_id" binding:"required"`
		Description string  `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var sale entity.SaleList
	if err := sc.DB.First(&sale, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}

	sale.SalePrice = input.SalePrice
	sale.ManagerID = &input.ManagerID
	sale.EmployeeID = &input.EmployeeID
	sale.Description = input.Description

	if err := sc.DB.Save(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	sc.DB.Preload("Car").Preload("Employee").Preload("Manager").First(&sale, sale.ID)

	c.JSON(http.StatusOK, sale)
}
