package controllers

import (
	"net/http"
	"strconv"
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
func (sc *SaleController) CreateSale(c *gin.Context) {
    carIDStr := c.Param("car_id")
    var carID uint
    if id, err := strconv.ParseUint(carIDStr, 10, 32); err == nil {
        carID = uint(id)
    } else {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid car_id"})
        return
    }

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

    sale := entity.SaleList{
        CarID:       carID,
        SalePrice:   input.SalePrice,
        Status:      "available",
        ManagerID:   &input.ManagerID,
        EmployeeID:  &input.EmployeeID,
        Description: input.Description,
    }

    if err := sc.DB.Create(&sale).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    sc.DB.Preload("Car").
        Preload("Employee").
        Preload("Manager").
        First(&sale, sale.ID)

    c.JSON(http.StatusOK, sale)
}