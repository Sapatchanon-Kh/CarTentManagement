import React from "react";
import { useParams } from "react-router-dom";
import SaleForm from "../../../components/SaleForm";

const CreateSellCarPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center", // กลางแนวนอน
        alignItems: "center",     // กลางแนวตั้ง
        minHeight: "95vh",       // ครอบหน้าจอเต็ม
        padding: 20,
        backgroundColor: "#f9f9f9",
      }}
    >
      <SaleForm carId={Number(carId)} mode="create" />
    </div>
  );
};

export default CreateSellCarPage;
