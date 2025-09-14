package controllers

import (
	"net/http"
	"strconv"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BuyCarController struct {
	DB *gorm.DB
}

func NewBuyCarController(db *gorm.DB) *BuyCarController {
	return &BuyCarController{DB: db}
}

// POST /bycar/buy/:id
func (bc *BuyCarController) BuyCar(c *gin.Context) {
	type BuyCarPayload struct {
		CustomerID uint `json:"customer_id"`
		EmployeeID uint `json:"employee_id"`
	}

	// 1. รับ carID จาก URL
	carIDStr := c.Param("carID")
	carID, err := strconv.ParseUint(carIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid car ID"})
		return
	}

	var payload BuyCarPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. หา SaleList ของ car ที่ status = "Available"
	var sale entity.SaleList
	if err := bc.DB.Where("car_id = ? AND status = ?", carID, "Available").First(&sale).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่มีรถที่พร้อมขาย"})
		return
	}

	// 3. สร้าง SalesContract
	contract := entity.SalesContract{
		SaleListID: sale.ID,
		EmployeeID: *sale.EmployeeID, // ต้อง check pointer ด้วย
		CustomerID: payload.CustomerID,
	}

	if err := bc.DB.Create(&contract).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างสัญญาซื้อขายไม่สำเร็จ"})
		return
	}

	// 4. อัปเดต SaleList.Status
	sale.Status = "Sold"
	if err := bc.DB.Save(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสถานะรถไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "ซื้อรถสำเร็จ",
		"contract_id": contract.ID,
	})
}
