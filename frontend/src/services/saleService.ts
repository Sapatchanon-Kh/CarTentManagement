// src/services/saleService.ts
import axios from 'axios';
import type { CarInfo, SaleInfo } from "../interface/Car";

const API_URL = "http://localhost:8080/sale";

export interface SaleListInfo {
    ID: number;
    employeeID: number;
}

export const getSaleListByCarAndPrice = async (carId: string, price: number): Promise<SaleListInfo | null> => {
    try {
        const formattedPrice = price.toFixed(1); // ✅ เพิ่มบรรทัดนี้เพื่อแปลงให้มีทศนิยม 2 ตำแหน่ง
        const response = await axios.get<SaleListInfo>(`${API_URL}/car/${carId}/price/${formattedPrice}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch sale list:", error);
        return null;
    }
};
export const getAllCarsWithSale = async (): Promise<CarInfo[]> => {
  const res = await axios.get(`${API_URL}/cars`);
  return res.data;
};

// สร้างรายการขายใหม่
export const createSale = async (sale: {
  car_id: number;
  sale_price: number;
  manager_id: number;   // ✅ ต้องมีด้วย
  employee_id: number;
  description: string;
}): Promise<SaleInfo> => {
  const res = await axios.post(API_URL, sale); 
  return res.data;
};

// ดึง SaleList ตาม ID พร้อมข้อมูล Car
export const getSaleById = async (saleId: number): Promise<SaleInfo> => {
  const res = await axios.get(`${API_URL}/${saleId}`);
  return res.data;
};

// อัปเดต Sale
export const updateSale = async (
  id: number,
  data: {
    sale_price: number;
    manager_id: number;   // ✅ ต้องมีด้วย
    employee_id: number;
    description: string;
  }
): Promise<SaleInfo> => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};
