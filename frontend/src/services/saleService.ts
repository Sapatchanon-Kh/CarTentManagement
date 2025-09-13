// src/services/saleService.ts
import axios from "axios";
import type { CarInfo, SaleInfo } from "../interface/Car";

const API_URL = "http://localhost:8080/sale";

// ดึงรถทั้งหมดพร้อม SaleList
export const getAllCarsWithSale = async (): Promise<CarInfo[]> => {
  const res = await axios.get(`${API_URL}/cars`);
  return res.data;
};

// สร้างรายการขายใหม่
export const createSale = async (sale: {
  car_id: number;
  sale_price: number;
  employee_id: number;  // 👈 เปลี่ยนเป็น employee_id ให้ตรง backend
  description: string;
}): Promise<SaleInfo> => {
  const res = await axios.post(`${API_URL}/`, sale);
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
    employee_id: number;   // 👈 เปลี่ยนเป็น employee_id ให้ตรง backend
    description: string;
  }
): Promise<SaleInfo> => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};
