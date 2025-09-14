import React from "react";
import { useParams } from "react-router-dom";
import SaleForm from "../../../components/SaleForm";

const EditSellPage: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();

  return (
    <div >
  <SaleForm saleId={Number(saleId)} mode="edit" />
  </div>
  );
};

export default EditSellPage;
