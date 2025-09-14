import type { SaleContract } from "./Salescontract";

export interface Insurance {
  id: string;
  planName: string;
  price: string;
  company: string;
  repairType: string;
  saleContract_id?: SaleContract;
};

// Component สำหรับแสดง Card แผนประกัน
export interface InsuranceCardProps {
  planName: string;
  price: string;
  features: string[];
  repairType: string;
  onSelectPlan: () => void;
};

export interface InsuranceDetails {
  planName: string;
  description: string;
  features: string[];
};