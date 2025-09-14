package controllers

import (
	"net/http"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RentContractController is the struct for handling rent contract operations.
type RentContractController struct {
	DB *gorm.DB
}

// NewRentContractController creates a new instance of RentContractController.
func NewRentContractController(db *gorm.DB) *RentContractController {
	return &RentContractController{DB: db}
}

// Payload สำหรับการสร้างสัญญาเช่า
type createRentContractPayload struct {
	CarID      uint    `json:"car_id"`
	CustomerID uint    `json:"customer_id"`
	StartDate  string  `json:"start_date"`
	EndDate    string  `json:"end_date"`
	TotalPrice float64 `json:"total_price"`
}

// POST /rent-contracts
// CreateRentContract handles the creation of a new rent contract.
func (controller *RentContractController) CreateRentContract(c *gin.Context) {
	var payload createRentContractPayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	// แปลงวันที่จาก string เป็น time.Time
	startDate, err := time.Parse("2006-01-02", payload.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
		return
	}
	endDate, err := time.Parse("2006-01-02", payload.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
		return
	}

	// ตรวจสอบข้อมูล Foreign Key
	var customer entity.Customer
	if err := controller.DB.First(&customer, payload.CustomerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	// ค้นหา RentList จาก CarID
	var rentList entity.RentList
	if err := controller.DB.Where("car_id = ?", payload.CarID).First(&rentList).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "RentList for the given car not found"})
		return
	}

	// สร้างสัญญาเช่าใหม่
	newRentContract := entity.RentContract{
		DateStart:  startDate,
		DateEnd:    endDate,
		RentListID: rentList.ID, // ใช้ ID ที่ค้นหาเจอ
		CustomerID: payload.CustomerID,
	}

	if err := controller.DB.Create(&newRentContract).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": newRentContract})
}