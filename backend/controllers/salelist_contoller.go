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
		Preload("Detail").
		Preload("SaleList").
		Find(&cars).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cars)
}

// GET /sale/:id
// ดึง SaleList ตาม ID พร้อมข้อมูล Car
func (sc *SaleController) GetSaleByID(c *gin.Context) {
	id := c.Param("id")
	var sale entity.SaleList

	if err := sc.DB.Preload("Pictures").
		Preload("Province").
		Preload("Detail").
		Preload("SaleList").First(&sale, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}

	c.JSON(http.StatusOK, sale)
}

// POST /sale
// สร้างรายการขายใหม่
func (sc *SaleController) CreateSale(c *gin.Context) {
	var input struct {
		CarID       uint    `json:"car_id" binding:"required"`
		SalePrice   float64 `json:"sale_price" binding:"required"`
		ManagerID   uint    `json:"manager_id" binding:"required"`
		Description string  `json:"description"` // รับ description
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sale := entity.SaleList{
		CarID:       input.CarID,
		SalePrice:   input.SalePrice,
		Status:      "available",
		ManagerID:   input.ManagerID,
		Description: input.Description,
	}

	if err := sc.DB.Create(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// return ข้อมูล SaleList พร้อม Car
	sc.DB.Preload("Car").First(&sale, sale.ID)
	c.JSON(http.StatusOK, sale)
}
