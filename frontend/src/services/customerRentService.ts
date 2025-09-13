// src/services/customerRentService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Interface สำหรับข้อมูลที่จะส่งไปสร้างสัญญาเช่า
export interface RentContractPayload {
  car_id: number;
  customer_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
}

const customerRentService = {
  // ฟังก์ชันสำหรับสร้างสัญญาเช่า
  async createRentContract(payload: RentContractPayload): Promise<any> {
    const { data } = await axios.post(`${API_URL}/rent-contracts`, payload);
    return data;
  },
};

export default customerRentService;