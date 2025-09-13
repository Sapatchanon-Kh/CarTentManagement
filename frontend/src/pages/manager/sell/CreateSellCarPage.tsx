import React from "react";
import { useParams } from "react-router-dom";
import SaleForm from "../../../components/SaleForm";

const CreateSellCarPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();

  return <SaleForm carId={Number(carId)} mode="create" />;
};

export default CreateSellCarPage;
