package utils

import (
	"fmt"
	"os"
	//"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/go-pdf/fpdf"
)

// GenerateReceiptPDF สร้างไฟล์ PDF สำหรับใบเสร็จ และ return error ถ้ามีปัญหา
func GenerateReceiptPDF(r entity.Receipt) error {
	// ✅ สร้างโฟลเดอร์เก็บไฟล์ถ้ายังไม่มี
	if err := os.MkdirAll("./static/receipt", os.ModePerm); err != nil {
		return err
	}

	// ✅ โหลดข้อมูลจาก Payment + Customer
	customerName := "Unknown Customer"
	amount := "N/A"
	if r.Payment != nil {
		if r.Payment.Customer != nil {
			customerName = fmt.Sprintf("%s %s", r.Payment.Customer.FirstName, r.Payment.Customer.LastName)
		}
		amount = r.Payment.Amount
	}

	// ✅ เริ่มสร้าง PDF
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 20)
	pdf.Cell(0, 15, "CarTent Management - Receipt")
	pdf.Ln(20)

	pdf.SetFont("Arial", "", 14)
	pdf.Cell(0, 10, fmt.Sprintf("Receipt No: %s", r.ReceiptNumber))
	pdf.Ln(10)
	pdf.Cell(0, 10, fmt.Sprintf("Date Issued: %s", r.IssueDate.Format("2006-01-02 15:04")))
	pdf.Ln(10)
	pdf.Cell(0, 10, fmt.Sprintf("Status: %s", r.Status))
	pdf.Ln(10)
	pdf.Cell(0, 10, fmt.Sprintf("Customer: %s", customerName))
	pdf.Ln(10)
	pdf.Cell(0, 10, fmt.Sprintf("Amount: %s บาท", amount))
	pdf.Ln(20)

	// ข้อความปิดท้าย
	pdf.SetFont("Arial", "I", 12)
	pdf.Cell(0, 10, "ขอบคุณที่ใช้บริการ CarTent Management")

	// ✅ กำหนด path สำหรับบันทึกไฟล์
	filePath := fmt.Sprintf("./static/receipt/%d.pdf", r.PaymentID)

	// ✅ บันทึกไฟล์
	return pdf.OutputFileAndClose(filePath)
}
