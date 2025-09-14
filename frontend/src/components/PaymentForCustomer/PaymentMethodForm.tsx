import React, { useState } from "react";
import axios from "axios";
import "./customer-payment.css";

interface PaymentMethodFormProps {
  payment: any;
  onClose: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ payment, onClose }) => {
  const [method, setMethod] = useState("ธนาคาร");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      alert("กรุณาอัปโหลดหลักฐานการชำระเงิน");
      return;
    }
    const formData = new FormData();
    formData.append("method", method);
    formData.append("file", file);
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:8080/api/payments/${payment.id}/proof`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("📤 ส่งการชำระเงินเรียบร้อยแล้ว");
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      alert("❌ อัปโหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>ชำระเงิน {payment.amount} บาท</h3>

        <label>
          วิธีการชำระ:
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="ธนาคาร">โอนผ่านธนาคาร</option>
            <option value="พร้อมเพย์">พร้อมเพย์</option>
          </select>
        </label>

        {method === "ธนาคาร" && (
          <div className="payment-info">
            <p><strong>เลขบัญชี:</strong> 123-456-7890</p>
            <p><strong>ชื่อบัญชี:</strong> บริษัท CarTent Management จำกัด</p>
          </div>
        )}

        {method === "พร้อมเพย์" && (
          <div className="payment-info">
            <p>สแกน QR Code เพื่อชำระเงิน (ทดสอบ)</p>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MockPromptPay1234567890"
              alt="QR Code พร้อมเพย์"
              className="qr-code"
            />
          </div>
        )}

        <label>
          อัปโหลดหลักฐาน:
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "กำลังส่ง..." : "ส่งหลักฐาน"}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
