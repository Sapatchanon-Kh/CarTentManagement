import type { SalesContract } from '../interface/Salescontract';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Interface for the data needed to create a contract
export interface CreateSalesContractData {
  SaleListID: number;
  EmployeeID: number;
  CustomerID: number;
}

/**
 * Creates a new sales contract.
 * @param contractData The data for the new sales contract.
 * @param token The authorization token for the logged-in user.
 * @returns The created sales contract.
 */
export const createSalesContract = async (
  contractData: CreateSalesContractData,
  token: string
): Promise<SalesContract> => {
  const response = await fetch(`${API_URL}/sales-contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contractData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create sales contract');
  }

  return response.json();
};

// ... (โค้ดส่วนอื่น)

// ✅ อัปเดตฟังก์ชัน buyCar
export const buyCar = async (carID: number, customerID: number, token: string): Promise<any> => {
    const payload = {
        customer_id: customerID,
    };
    const response = await axios.post(
        `http://localhost:8080/bycar/buy/${carID}`, 
        payload,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
};