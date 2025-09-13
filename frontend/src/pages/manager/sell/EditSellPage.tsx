import React from "react";
import { useParams } from "react-router-dom";
import SaleForm from "../../../components/SaleForm";

const EditSellPage: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();

  return <SaleForm saleId={Number(saleId)} mode="edit" />;
};

export default EditSellPage;
