package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity" // ตรวจสอบ Path ให้ถูกต้อง
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PaymentInput เป็น struct สำหรับรับข้อมูลเมื่อสร้างรายการใหม่
type PaymentInput struct {
	SalesContractID *uint     `json:"SalesContractID"`
	PaymentMethodID uint      `json:"PaymentMethodID"`
	EmployeeID      uint      `json:"EmployeeID"`
	CustomerID      uint      `json:"CustomerID"`
	Amount          string    `json:"Amount"`
	PaymentDate     time.Time `json:"PaymentDate"`
	Status          string    `json:"Status"` // รับสถานะเป็น string โดยตรง
}

type PaymentController struct {
	DB *gorm.DB
}

func NewPaymentController(db *gorm.DB) *PaymentController {
	return &PaymentController{DB: db}
}

// POST /payments
// สร้างรายการชำระเงินใหม่
func (ctrl *PaymentController) CreatePayment(c *gin.Context) {
	var input PaymentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// กำหนดค่าเริ่มต้นให้สถานะ หากไม่ได้ส่งมา
	initialStatus := input.Status
	if initialStatus == "" {
		initialStatus = entity.StatusChecking // "รอตรวจสอบ"
	}

	payment := entity.Payment{
		SalesContractID: input.SalesContractID,
		PaymentMethodID: input.PaymentMethodID,
		EmployeeID:      input.EmployeeID,
		CustomerID:      input.CustomerID,
		Amount:          input.Amount,
		PaymentDate:     input.PaymentDate,
		Status:          initialStatus, // ใช้ field 'Status' และเป็นชนิด string
	}

	if err := ctrl.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": payment})
}

// GET /payments
// ดึงข้อมูลการชำระเงินทั้งหมด
func (ctrl *PaymentController) ListPayments(c *gin.Context) {
	var payments []entity.Payment
	if err := ctrl.DB.
		Preload("SalesContract.Customer").
		Preload("PaymentMethod").
		Preload("Employee").
		Preload("Customer"). // Preload Customer โดยตรงด้วย
		Find(&payments).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": payments})
}

// In payment_controller.go
// GET /payments/:id
// ดึงข้อมูลการชำระเงินตาม ID
func (ctrl *PaymentController) GetPayment(c *gin.Context) {
    id := c.Param("id")
    var payment entity.Payment
    if err := ctrl.DB.
        Preload("SalesContract").
        Preload("RentContract").
        Preload("Customer").
        Preload("PaymentMethod").
        First(&payment, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": payment})
}

// PATCH /payments/:id/status
// อัปเดตสถานะการชำระเงิน
func (ctrl *PaymentController) UpdatePaymentStatus(c *gin.Context) {
	id := c.Param("id")
	var payment entity.Payment
	if err := ctrl.DB.First(&payment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment record not found"})
		return
	}

	var input struct {
		StatusName string `json:"status_name"` // รับค่าจาก frontend key "status_name"
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	// อัปเดต field 'Status' ด้วยค่า string ที่ได้รับมาโดยตรง
	if err := ctrl.DB.Model(&payment).Update("status", input.StatusName).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ดึงข้อมูลล่าสุดเพื่อส่งกลับไป
	if err := ctrl.DB.
		Preload("SalesContract.Customer").
		Preload("PaymentMethod").
		Preload("Employee").
		Preload("Customer").
		First(&payment, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated payment data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": payment})
}

// DELETE /payments/:id
// ลบรายการชำระเงิน
func (ctrl *PaymentController) DeletePayment(c *gin.Context) {
	id := c.Param("id")
	if tx := ctrl.DB.Delete(&entity.Payment{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Payment deleted successfully"})
}

// GET /payments/customer/:customerID
// ดึงข้อมูลการชำระเงินทั้งหมดของลูกค้าตาม ID
func (ctrl *PaymentController) ListPaymentsByCustomer(c *gin.Context) {
	customerID := c.Param("customerID")
	var payments []entity.Payment
	if err := ctrl.DB.
		Preload("SalesContract").
		Preload("RentContract").
		Preload("PaymentMethod").
		Preload("Customer").
		Where("customer_id = ?", customerID).
		Find(&payments).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": payments})
}

// UploadPaymentProof handles the file upload for payment slips.
func (ctrl *PaymentController) UploadPaymentProof(c *gin.Context) {
	// 1. Get payment ID from URL
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	// 2. Get the uploaded file and method from the form data
	file, err := c.FormFile("slip")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file from form data"})
		return
	}

	paymentMethod := c.PostForm("proof_method")
	if paymentMethod == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment method is required"})
		return
	}
 // 3. ค้นหารายการชำระเงินในฐานข้อมูล
    var payment entity.Payment
    if tx := ctrl.DB.
        Preload("SalesContract").
        Preload("RentContract").
        First(&payment, id); tx.RowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
        return
    }

    // 4. สร้างชื่อไฟล์ที่ไม่ซ้ำกันตามประเภทสัญญา
    var filename string
    if payment.SalesContractID != nil {
        // ถ้าเป็นสัญญาซื้อขาย ให้ใช้ "sc_{sales_contract_id}" เป็นชื่อไฟล์
        filename = fmt.Sprintf("sc_%d%s", *payment.SalesContractID, filepath.Ext(file.Filename))
    } else {
        // ถ้าเป็นสัญญาประเภทอื่น (เช่น เช่า) ให้ใช้ชื่อเดิมที่มี Timestamp เพื่อความไม่ซ้ำ
        filename = fmt.Sprintf("payment_%d_%d%s", payment.ID, time.Now().UnixNano(), filepath.Ext(file.Filename))
    }
    
    // ตรวจสอบให้แน่ใจว่าโฟลเดอร์มีอยู่จริง
    if err := os.MkdirAll("uploads/slips", os.ModePerm); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
        return
    }

    dst := filepath.Join("uploads", "slips", filename)

    if err := c.SaveUploadedFile(file, dst); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    // 5. อัปเดตรายการชำระเงินในฐานข้อมูล
    payment.ProofURL = fmt.Sprintf("/uploads/slips/%s", filename)
    payment.ProofMethod = paymentMethod
    payment.Status = "รอตรวจสอบ"

    if err := ctrl.DB.Save(&payment).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment record"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Slip uploaded and payment status updated successfully"})
}