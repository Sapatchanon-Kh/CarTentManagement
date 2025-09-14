import React, { useState } from "react";
import PaymentList from "../../../components/PaymentForCustomer/PaymentList";
import "../../../components/PaymentForCustomer/customer-payment.css";
import { Typography } from 'antd';

const { Title } = Typography;

const CustomerPaymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("ซื้อ");

  return (
    <div className="customer-payment-page">
      <Title level={2} className="page-title" style={{ color: '#d4af37' }}>💳 การชำระเงิน</Title>
      <div className="tabs">
        {["ซื้อ", "เช่า"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <PaymentList type={activeTab} />
    </div>
  );
};

export default CustomerPaymentPage;