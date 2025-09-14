package entity

// กำหนด Status แบบ string ตรง ๆ เพื่อให้ใช้งานง่าย
// และไม่กระทบ field Status ที่ยังเป็น string อยู่ใน Payment
const (
	StatusPending   = "รอชำระ"     // ลูกค้ายังไม่ได้อัปโหลดหลักฐาน
	StatusChecking  = "รอตรวจสอบ" // ลูกค้าอัปโหลดแล้ว รอพนักงานตรวจสอบ
	StatusApproved  = "ชำระแล้ว"   // อนุมัติ ออกใบเสร็จเรียบร้อย
	StatusRejected  = "ถูกปฏิเสธ"  // หลักฐานไม่ถูกต้อง
)
