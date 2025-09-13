// ✅ 1. แก้ไข API_URL ให้เป็น URL หลักของ Backend
const API_URL = "http://localhost:8080";

export const createBooking = async (saleListID: number, customerID: number, token: string): Promise<any> => {
  // ✅ 2. แก้ไข path ใน fetch ให้ชี้ไปที่ /bookings ตรงๆ
  const response = await fetch(`${API_URL}/bookings`, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sale_list_id: saleListID,
      customer_id: customerID,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create booking");
  }

  return response.json();
};