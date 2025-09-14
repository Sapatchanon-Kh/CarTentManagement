import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeePaymentDetail from "./EmployeePaymentDetail";
import "./employee-payment.css";

interface Payment {
  id: number;
  amount: string;
  payment_date: string;
  status: string;
  customer?: { first_name: string; last_name: string }; // แก้ไขตรงนี้
  employee?: { firstName: string; lastName: string }; // แก้ไขตรงนี้
}

const EmployeePaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<string>("ทั้งหมด");

  const fetchPayments = () => {
    axios
      .get("http://localhost:8080/api/payments")
      .then((res) => setPayments(res.data))
      .catch((err) => console.error("Fetch error", err));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments =
    filter === "ทั้งหมด"
      ? payments
      : payments.filter((p) => p.status === filter);

  return (
    <div className="employee-payment-page">
      <h2 className="section-title">การชำระเงินทั้งหมด</h2>

      <div className="status-tabs">
        {["ทั้งหมด", "รอตรวจสอบ", "ชำระแล้ว", "ถูกปฏิเสธ"].map((s) => (
          <button
            key={s}
            className={filter === s ? "active" : ""}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card-container">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id} // ✨ This is the fix
            className="payment-card"
            onClick={() => setSelectedPayment(payment)}
          >
            <div className="card-header">
              <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
              <span className={`status-badge ${payment.status}`}>
                {payment.status}
              </span>
            </div>
            <p className="amount">{payment.amount} บาท</p>
            <p>ลูกค้า: {payment.customer?.first_name || "ไม่ทราบ"} {payment.customer?.last_name || ""}</p>
            <p>พนักงาน: {payment.employee?.firstName || "ไม่ทราบ"} {payment.employee?.lastName || ""}</p>
          </div>
        ))}
      </div>
      {selectedPayment && (
        <EmployeePaymentDetail
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onUpdated={fetchPayments}
        />
      )}
    </div>
  );
};

export default EmployeePaymentList;
