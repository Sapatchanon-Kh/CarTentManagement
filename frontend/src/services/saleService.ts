// src/services/saleService.ts
import axios from 'axios';

const API_URL = "http://localhost:8080/salelists";

export interface SaleListInfo {
    ID: number;
    EmployeeID: number;
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