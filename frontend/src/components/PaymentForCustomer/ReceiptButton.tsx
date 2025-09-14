import React, { useState } from "react";
import axios from "axios";
import "./customer-payment.css";

interface Receipt {
  receiptnumber: string;
  issuedate: string;
  status: string;
  payment?: {
    amount: string;
    proof_method: string;
  };
}

interface ReceiptButtonProps {
  paymentId?: number;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({ paymentId }) => {
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const fetchReceipt = async () => {
    if (!paymentId) {
      alert("❌ ไม่พบ Payment ID");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/receipts/${paymentId}`);
      if (res.data.length > 0) {
        setReceipt(res.data[0]);
      } else {
        alert("❌ ไม่มีใบเสร็จสำหรับการชำระนี้");
      }
    } catch (error) {
      console.error("Fetch receipt failed", error);
      alert("❌ โหลดใบเสร็จไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn-secondary" onClick={fetchReceipt} disabled={loading}>
        {loading ? "กำลังโหลด..." : "📄 ดูใบเสร็จ"}
      </button>

      {receipt && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🧾 ใบเสร็จรับเงิน</h3>
            <div className="payment-info">
              <p><strong>เลขที่ใบเสร็จ:</strong> {receipt.receiptnumber}</p>
              <p><strong>วันที่ออก:</strong> {new Date(receipt.issuedate).toLocaleDateString()}</p>
              <p><strong>สถานะ:</strong> {receipt.status}</p>
              <p><strong>ยอดเงิน:</strong> {receipt.payment?.amount} บาท</p>
              <p><strong>วิธีชำระ:</strong> {receipt.payment?.proof_method}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setReceipt(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceiptButton;
