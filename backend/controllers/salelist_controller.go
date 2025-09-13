package controllers

import (
	"fmt"
	"net/http"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SaleListController struct {
	DB *gorm.DB
}

func NewSaleListController(db *gorm.DB) *SaleListController {
	return &SaleListController{DB: db}
}

// GET /salelists/car/:carId/price/:price
func (slc *SaleListController) GetSaleListByCarAndPrice(c *gin.Context) {
	carId := c.Param("carId")
	priceStr := c.Param("price")
	var price float64
	fmt.Sscanf(priceStr, "%f", &price)

	var saleList entity.SaleList
	if err := slc.DB.Where("car_id = ? AND sale_price = ?", carId, price).First(&saleList).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale list not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ID":         saleList.ID,
		"EmployeeID": saleList.EmployeeID,
	})
}