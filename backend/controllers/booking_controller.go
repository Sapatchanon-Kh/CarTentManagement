package controllers

import (
	"net/http"
	// "time"
	"fmt" 
	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/PanuAutawo/CarTentManagement/backend/services" // ✅ 1. Import service
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BookingController struct {
	service *services.BookingService // ✅ 2. เปลี่ยนจาก DB เป็น service
}

func NewBookingController(db *gorm.DB) *BookingController {
	return &BookingController{
		service: services.NewBookingService(db), // ✅ 3. สร้าง instance ของ service
	}
}
// POST /bookings
func (bc *BookingController) CreateBooking(c *gin.Context) {
	var payload struct {
		// ✅ 2. ตรวจสอบให้แน่ใจอีกครั้งว่าไม่มีการเว้นวรรคผิด
		CustomerID uint `json:"customer_id" binding:"required"`
		SaleListID uint `json:"sale_list_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ 3. [สำคัญ] พิมพ์ค่าที่รับได้ออกมาดูใน Terminal
	fmt.Printf("--- New Booking Request ---\n")
	fmt.Printf("Received CustomerID: %d\n", payload.CustomerID)
	fmt.Printf("Received SaleListID: %d\n", payload.SaleListID)
	fmt.Printf("---------------------------\n")


	exists, err := bc.service.CheckExistingBooking(payload.CustomerID, payload.SaleListID)
	if err != nil {
		fmt.Printf("Error checking existing booking: %v\n", err) // เพิ่ม Log
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking existence"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "คุณได้จองรถคันนี้ไปแล้ว"})
		return
	}

	newBooking := entity.Booking{
		CustomerID: payload.CustomerID,
		SaleListID: payload.SaleListID,
	}

	if err := bc.service.Create(&newBooking); err != nil {
		// ✅ 4. [สำคัญที่สุด] พิมพ์ Error ที่แท้จริงจาก Database ออกมา
		fmt.Printf("!!! DATABASE ERROR !!!\n")
		fmt.Printf("Failed to create booking: %v\n", err)
		fmt.Printf("!!!!!!!!!!!!!!!!!!!!!!\n")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "booking": newBooking})
}