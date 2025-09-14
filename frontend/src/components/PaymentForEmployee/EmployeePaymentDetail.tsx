import React from "react";
import axios from "axios";
import "./employee-payment.css";

interface Payment {
  id: number;
  amount: string;
  payment_date: string;
  status: string;
  customer?: { first_name: string; last_name: string }; // แก้ไขตรงนี้
  employee?: { firstName: string; lastName: string }; // แก้ไขตรงนี้
}

interface Props {
  payment: Payment;
  onClose: () => void;
  onUpdated: () => void;
}

const EmployeePaymentDetail: React.FC<Props> = ({ payment, onClose, onUpdated }) => {
  const updateStatus = async (status: string) => {
    if (!payment?.id) {
      alert("❌ ไม่พบ Payment ID");
      return;
    }

    try {
      await axios.patch(`http://localhost:8080/api/payments/${payment.id}`, {
        status,
      });
      alert(`✅ อัปเดตสถานะเป็น "${status}" สำเร็จ`);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ ไม่สามารถอัปเดตสถานะได้");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>รายละเอียดการชำระเงิน</h3>
        <p>รหัส: {payment.id}</p>
        <p>จำนวนเงิน: {payment.amount} บาท</p>
        <p>วันที่: {new Date(payment.payment_date).toLocaleDateString()}</p>
        <p>สถานะ: {payment.status}</p>
        <p>ลูกค้า: {payment.customer?.first_name || "ไม่ทราบ"} {payment.customer?.last_name || ""}</p>
        <p>พนักงาน: {payment.employee?.firstName || "ไม่ทราบ"} {payment.employee?.lastName || ""}</p>


        <div className="modal-actions">
          <button
            className="btn-success"
            onClick={() => updateStatus("ชำระแล้ว")}
          >
            ยืนยัน
          </button>
          <button
            className="btn-danger"
            onClick={() => updateStatus("ถูกปฏิเสธ")}
          >
            ปฏิเสธ
          </button>
          <button className="btn-secondary" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeePaymentDetail;
